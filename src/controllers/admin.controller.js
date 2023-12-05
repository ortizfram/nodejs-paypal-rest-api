import userSearch from "../public/js/userSearch.js";

const getUsers = async (req, res) => {
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const searchQuery = req.query.search || '';

    try {
      // Declare
      const isAdmin = req.session.user && req.session.user.role === 'admin';
      
      //validation
      if (!isAdmin) {
        return res.status(403).send(`Unauthorized ${req.sesison.user.role}`);
      }

      // searchbar & fetch
      const userRows = await userSearch(searchQuery);
  
      res.render("admin/usersPanel", { users: userRows, user, message, searchQuery });
    } catch (error) {
      console.error("Error while fetching users:", error);
      res.status(500).send("Internal Server Error");
    }
};
 
  
export default {
    getUsers,
};