-- Set first user as admin (or update email as needed)
UPDATE "user" 
SET role = 'admin' 
WHERE email = (SELECT email FROM "user" LIMIT 1);

-- Alternative: Set specific user as admin (uncomment and update email)
-- UPDATE "user" SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- Verify admin was set
SELECT email, role FROM "user";
