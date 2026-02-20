
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking for invitations table...');
    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error accessing invitations table:', error);
    } else {
        console.log('Invitations table exists. Access successful.');
    }
}

checkTable();
