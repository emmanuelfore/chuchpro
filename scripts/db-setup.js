import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function migrate() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 30000, // 30 seconds to connect
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        console.log('Resetting public schema...');
        await client.query(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO anon;
            GRANT ALL ON SCHEMA public TO authenticated;
            GRANT ALL ON SCHEMA public TO service_role;
            
            -- Enable extensions in public schema if needed, or ensuring they are in search_path
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
            CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
            
            SET search_path TO public, extensions;
        `);
        console.log('Schema reset complete.');

        const schemaPath = path.join(__dirname, '..', 'docs', 'schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        // Note: The pg driver can execute multiple statements in one query call
        await client.query(sql);
        console.log('Schema executed successfully.');

    } catch (err) {
        console.error('Migration failed:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
        if (err.position) {
            console.error('Error near characters:', err.position);
            // Optional: log a snippet of the SQL around the error position
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
