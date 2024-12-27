-- User count SQL query
select count(*) from users;

-- List All Users SQL query
select users.id as "id", users.id as "user_id", pe.email as "username", pe.email as "email", users.name as "firstName", CASE WHEN pe.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails pe left join users on pe.user_id = users.id where pe.primary = TRUE

-- Find user by id SQL query
select users.id as "id", users.id as "user_id", pe.email as "username", pe.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id left join user_emails pe ON ue.user_id = pe.user_id AND pe.primary = TRUE where cast(users.id as character varying) = ? AND ue.confirmed_at IS NOT NULL GROUP BY pe.id, users.id, pe.email, users.name, ue.confirmed_at

-- Find user by username SQL query
select users.id as "id", users.id as "user_id", pe.email as "username", pe.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id LEFT JOIN user_emails pe ON ue.user_id = pe.user_id AND pe.primary = TRUE where LOWER(ue.email) = LOWER(?) AND ue.confirmed_at IS NOT NULL GROUP BY pe.id, users.id, pe.email, users.name, ue.confirmed_at

-- Find user by email SQL query
select users.id as "id", users.id as "user_id", pe.email as "username", pe.email as "email", users.name as "firstName", CASE WHEN ue.confirmed_at IS NOT NULL THEN 'TRUE' ELSE NULL END as "EMAIL_VERIFIED" from user_emails ue left join users on ue.user_id = users.id LEFT JOIN user_emails pe ON ue.user_id = pe.user_id AND pe.primary = TRUE where LOWER(ue.email) = LOWER(?) AND ue.confirmed_at IS NOT NULL GROUP BY pe.id, users.id, pe.email, users.name, ue.confirmed_at

-- Find user by search term SQL query
SELECT users.id AS "id", users.id AS "user_id", pe.email AS "username", pe.email AS "email", users.name AS "firstName", CASE WHEN MAX(CASE WHEN pe.confirmed_at IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'TRUE' ELSE NULL END AS "EMAIL_VERIFIED" FROM user_emails ue LEFT JOIN users ON ue.user_id = users.id LEFT JOIN user_emails pe ON ue.user_id = pe.user_id AND pe.primary = TRUE WHERE LOWER(pe.email) LIKE LOWER(CONCAT('%', ?, '%')) OR LOWER(users.name) LIKE LOWER(CONCAT('%', ?, '%')) OR (ue.primary = FALSE AND ue.confirmed_at IS NOT NULL AND LOWER(ue.email) LIKE LOWER(CONCAT('%', ?, '%'))) GROUP BY pe.id, users.id, pe.email, users.name

-- Find password hash (blowfish or hash digest hex) SQL query
select encrypted_password as hash_pwd from users right join user_emails ue on users.id = ue.user_id where ue.email = ?
