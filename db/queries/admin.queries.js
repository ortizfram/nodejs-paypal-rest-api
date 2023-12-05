export const listUsers_q = `
SELECT * FROM users
`;

export const makeUserAdmin_q = `
    UPDATE users SET role = ? WHERE id = ?
`;