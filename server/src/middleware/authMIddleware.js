export const requireAuth = (req, res, next) => {
    // Check if the user is authenticated
    if (!req.session || !req.session.user || !req.session.user.id) {
      // If not authenticated, return a 401 Unauthorized response with a redirect URL
      return res.redirect('/login');
    }
    // If authenticated, proceed to the next middleware or route handler
    next();
  };