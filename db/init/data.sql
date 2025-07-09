-- INSERT DEFAULT ROLES
INSERT INTO roles (id, name)
VALUES 
  (1, 'ROLE_ADMIN'),
  (2, 'ROLE_USER');

-- INSERT ADMIN
INSERT INTO users (
  id,
  username,
  first_name,
  last_name,
  password,
  city,
  state,
  preferred_language,
  date_of_birth,
  role_id
)
VALUES (
   uuid_generate_v4(),
  'admin',
  'Admin',
  'Adminovic',
  '$2b$10$SL/x3uyVzbHM8zS1TciCTehJEHHeeUEe3qeZgGO.NH1YIE3fC09Na',
  'Belgrade',
  'Serbia',
  'en',
  '1985-01-01',
  1
);