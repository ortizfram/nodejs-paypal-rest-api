export const listUsers_q = `
SELECT * FROM users
`;

export const setUserRole_q = `
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