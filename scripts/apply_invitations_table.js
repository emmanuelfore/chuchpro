
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We need the SERVICE_ROLE_KEY to run administrative tasks ideally, 
// but we only have ANON_KEY in .env usually. 
// If we can't run DDL, we have to ask the user to run it.
// However, Supabase sometimes allows running SQL via a stored procedure if one exists for that purpose.
// Since we don't have a 'exec_sql' function, we might be stuck.

// Let's check if we can use the 'postgres' connection string from .env directly using 'pg' package!
// The .env file had: DATABASE_URL=postgresql://postgres.fdivyxnqodzobrlnpsvk:Bethatman123!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

import pg from 'pg';
const { Client } = pg;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
});

console.log('Attempting to connect with URL:', dbUrl.replace(/:[^:]*@/, ':****@'));


async function applyMigration() {
    try {
        await client.connect();
        console.log('Connected to database directly via Postgres...');

        const sql = `
            -- Helper Functions for RLS (Security Definer)
            CREATE OR REPLACE FUNCTION current_user_org_id() 
            RETURNS UUID AS $$
                SELECT organization_id FROM public.users WHERE id = auth.uid();
            $$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

            CREATE OR REPLACE FUNCTION current_user_role() 
            RETURNS VARCHAR AS $$
                SELECT role FROM public.users WHERE id = auth.uid();
            $$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

            CREATE TABLE IF NOT EXISTS invitations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('program_admin', 'facilitator')),
                token VARCHAR(100) NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                accepted_at TIMESTAMP WITH TIME ZONE,
                created_by UUID REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_active_invite UNIQUE(organization_id, email)
            );

            -- RLS
            ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

            -- Policies
            DROP POLICY IF EXISTS "Admins can view invitations" ON invitations;
            CREATE POLICY "Admins can view invitations" ON invitations
                FOR SELECT USING (
                    organization_id = current_user_org_id() 
                    AND current_user_role() IN ('system_admin', 'program_admin')
                );
            
            DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
            CREATE POLICY "Admins can create invitations" ON invitations
                FOR INSERT WITH CHECK (
                    organization_id = current_user_org_id() 
                    AND current_user_role() IN ('system_admin', 'program_admin')
                );

            -- Allow deletion too
            DROP POLICY IF EXISTS "Admins can delete invitations" ON invitations;
            CREATE POLICY "Admins can delete invitations" ON invitations
                FOR DELETE USING (
                    organization_id = current_user_org_id() 
                    AND current_user_role() IN ('system_admin', 'program_admin')
                );

             DROP POLICY IF EXISTS "Anyone can read invite by token" ON invitations;
             CREATE POLICY "Anyone can read invite by token" ON invitations
                FOR SELECT USING (true); 

            -- Grant access
            GRANT ALL ON invitations TO anon, authenticated, service_role;
            
            NOTIFY pgrst, 'reload schema';
        `;

        await client.query(sql);
        console.log('Migration applied successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
