-- One-time repair script for partial user mugishaandy@gmail.com
-- This script should be run manually and then deleted after successful repair
-- DO NOT commit this to production as a permanent migration

-- Step 1: Get the Auth user ID for mugishaandy@gmail.com
-- Run this first to get the user_id, then update the script below with the actual ID

-- The user_id needs to be obtained from auth.users table
-- Replace 'ACTUAL_USER_ID_HERE' with the actual UUID from auth.users

-- Step 2: Create or update the profile
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  is_active,
  must_change_password,
  metadata
) VALUES (
  'ACTUAL_USER_ID_HERE', -- Replace with actual UUID from auth.users
  'mugishaandy@gmail.com',
  'mugishaandy',
  true,
  true,
  '{"invited_by": "REPAIR_SCRIPT", "school_id": "9dbbf354-c439-4820-a9c0-6dd0e7555d67"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  must_change_password = true,
  metadata = profiles.metadata || '{"repaired": true}'::jsonb;

-- Step 3: Create or reactivate school membership
INSERT INTO public.school_memberships (
  school_id,
  user_id,
  campus_id,
  status,
  invited_by
) VALUES (
  '9dbbf354-c439-4820-a9c0-6dd0e7555d67',
  'ACTUAL_USER_ID_HERE', -- Replace with actual UUID from auth.users
  (SELECT id FROM public.campuses WHERE school_id = '9dbbf354-c439-4820-a9c0-6dd0e7555d67' AND is_main = true LIMIT 1),
  'active',
  'REPAIR_SCRIPT'
) ON CONFLICT (school_id, user_id) DO UPDATE SET
  status = 'active',
  invited_by = 'REPAIR_SCRIPT';

-- Step 4: Assign a default school role (e.g., teacher or the intended role)
-- First, get the membership_id from the previous step
-- Then assign the appropriate role

-- Get the appropriate role ID (e.g., teacher, or whatever role was intended)
-- This assumes there's a global or school-specific role
INSERT INTO public.membership_roles (
  membership_id,
  role_id,
  assigned_by
)
SELECT 
  sm.id,
  r.id,
  'REPAIR_SCRIPT'
FROM public.school_memberships sm
CROSS JOIN public.roles r
WHERE sm.school_id = '9dbbf354-c439-4820-a9c0-6dd0e7555d67'
  AND sm.user_id = 'ACTUAL_USER_ID_HERE' -- Replace with actual UUID
  AND (r.school_id = sm.school_id OR r.school_id IS NULL)
  AND r.code = 'teacher' -- Change to the intended role code
  AND r.is_active = true
ON CONFLICT (membership_id, role_id) DO NOTHING;

-- Verify the repair
SELECT 
  p.id as user_id,
  p.email,
  p.is_active,
  p.must_change_password,
  sm.id as membership_id,
  sm.status as membership_status,
  r.code as role_code,
  r.name as role_name
FROM public.profiles p
LEFT JOIN public.school_memberships sm ON p.id = sm.user_id AND sm.school_id = '9dbbf354-c439-4820-a9c0-6dd0e7555d67'
LEFT JOIN public.membership_roles mr ON sm.id = mr.membership_id
LEFT JOIN public.roles r ON mr.role_id = r.id
WHERE p.email = 'mugishaandy@gmail.com';
