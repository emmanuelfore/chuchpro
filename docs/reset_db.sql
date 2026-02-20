-- ============================================
-- DANGER: Database Reset Script
-- ============================================
-- This script will truncate ALL tables in the public schema
-- and reset identity sequences. Data will be LOST.

BEGIN;

-- Disable triggers to avoid foreign key constraints during truncation
SET session_replication_role = 'replica';

TRUNCATE TABLE 
    users,
    organizations,
    organization_subscriptions,
    programs,
    sessions,
    enrollments,
    session_enrollments,
    payments,
    attendance,
    assignments,
    assignment_submissions,
    badges,
    user_badges,
    certificates,
    news_posts
RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Clean up Auth Users (Critical for "User already registered" error)
-- This deletes all registered users from Supabase Auth
DELETE FROM auth.users;

COMMIT;

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Database has been successfully cleared.';
END $$;
