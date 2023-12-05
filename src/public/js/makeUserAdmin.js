import { makeUserAdmin_q } from "../../../db/queries/admin.queries.js";

const makeUserAdmin = async (userId) => {
    try {
      // Update the user's role to 'admin' in the database
      const roleRows = await pool.query(makeUserAdmin_q, ['admin', userId]);
  
      if (roleRows.affectedRows > 0) {
        // Role updated successfully
        console.log(`\n\nUser ID ${userId}: is now an admin.`);
      } else {
        // No user found or role wasn't updated
        console.log(`\n\nUser ID ${userId}: not found or role not updated.`);
      }
    } catch (error) {
      // Handle the error
      console.error('Error updating user role:', error);
    }
  };
  
export default makeUserAdmin;
  