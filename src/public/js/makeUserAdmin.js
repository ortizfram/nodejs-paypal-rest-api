// makeUserAdmin.js
import { getUserByEmail_q, makeUserAdmin_q } from "../../../db/queries/admin.queries.js";
import { pool } from "../../db.js";

const getUserByEmail = async (email) => {
  try {
    // Query to fetch user by email
    const [userRows] = await pool.query(getUserByEmail_q, [email]);
    return userRows[0]; // Return the first user found (if any)
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error; // Handle or propagate the error as needed
  }
};

 const makeUserAdmin = async (email) => {
  try {
    // Fetch the user by email
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return; // Exit if user not found
    }

    // Update the user's role to 'admin' in the database
    const roleRows = await pool.query(makeUserAdmin_q, ['admin', email]);

    if (roleRows.affectedRows > 0) {
      // Role updated successfully
      console.log(`User with email ${email} is now an admin.`);
    } else {
      // Role wasn't updated
      console.log(`Role not updated for user with email ${email}.`);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};
  

export default makeUserAdmin;