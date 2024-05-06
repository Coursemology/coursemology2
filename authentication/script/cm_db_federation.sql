-- User count SQL query
select count(*) from users;

-- List All Users SQL query
select ue.id as "id", users.id as "user_id", ue.email as "username", ue.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id

-- Find user by id SQL query
select ue.id as "id", users.id as "user_id", ue.email as "username", ue.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id where cast(ue.id as character varying) = ?

-- Find user by username SQL query
select ue.id as "id", users.id as "user_id", ue.email as "username", ue.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id where LOWER(ue.email) = LOWER(?)

-- Find user by email SQL query
select ue.id as "id", users.id as "user_id", ue.email as "username", ue.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id where LOWER(ue.email) = LOWER(?)

-- Find user by search term SQL query
select ue.id as "id", users.id as "user_id", ue.email as "username", ue.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED"from user_emails ue left join users on ue.user_id = users.id where LOWER(ue.email) like LOWER(concat('%', ?, '%')) or LOWER(users.name) like LOWER(concat('%', ?, '%'))

-- Find password hash (blowfish or hash digest hex) SQL query
select encrypted_password as hash_pwd from users right join user_emails ue on users.id = ue.user_id where ue.email = ?
