export const listUsers_q = `
SELECT * FROM users
`;

export const makeUserAdmin_q = `
    UPDATE users SET role = ? WHERE email = ?
`;

export const getUserByEmail_q = `
   SELECT * FROM users WHERE email = ?
`;

export const userSearch_q= `
    SELECT * FROM users 
    WHERE 
    username LIKE ? OR 
    name LIKE ? OR 
    email LIKE ? OR 
    role LIKE ?
`;