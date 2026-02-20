
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    console.log('Testing Organization Creation...');
    const orgName = `Test Org ${Date.now()}`;
    const orgSlug = `test-org-${Date.now()}`;
    const email = `test-${Date.now()}@example.com`;

    try {
        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([{
                name: orgName,
                slug: orgSlug,
                contact_email: email,
                primary_color: '#000000',
                secondary_color: '#ffffff'
            }])
            .select()
            .single();

        if (orgError) {
            console.error('Organization Creation Failed:', orgError);
            return;
        }
        console.log('Organization Created:', org.id);

        // 2. Simulate User Profile Creation (Skipping auth.signUp)
        const fakeUserId = crypto.randomUUID();
        console.log('Testing User Profile Creation for ID:', fakeUserId);

        const { data: user, error: userError } = await supabase
            .from('users')
            .insert([{
                id: fakeUserId,
                organization_id: org.id,
                email: email,
                first_name: 'Test',
                surname: 'User',
                role: 'system_admin',
                is_active: true
            }])
            .select();

        if (userError) {
            console.error('User Profile Creation Failed:', userError);
        } else {
            console.log('User Profile Created Successfully:', user);
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testSignup();
