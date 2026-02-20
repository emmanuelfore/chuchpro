-- Add auth_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Backfill auth_id with id for existing users to maintain access
-- This assumes current users have id matching auth.uid()
UPDATE users SET auth_id = id WHERE auth_id IS NULL;

-- Make auth_id NOT NULL after backfill (optional, depends if we always want it linked)
-- ALTER TABLE users ALTER COLUMN auth_id SET NOT NULL;

-- Update RLS policies (if any exist on users table) to use auth_id instead of id
-- This is a placeholder as no RLS policies were explicitly defined in the schema dump provided earlier,
-- but typically needed for Supabase.

-- Important: Drop the unique constraint on email per organization if we want same email in multiple orgs?
-- No, the constraint unique_email_per_org UNIQUE(organization_id, email) is correct for multi-tenancy.
-- A user can be in Org A with email X, and in Org B with email X.
-- The user table will have 2 rows:
-- Row 1: id=UUID1, org=OrgA, email=X, auth_id=AuthX
-- Row 2: id=UUID2, org=OrgB, email=X, auth_id=AuthX
