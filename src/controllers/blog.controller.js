const getblogList = async (req, res, next) => {
  console.log("\n\n*** getCourseCreate\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
//   const userId = user.id || null;
  const userId =  null;

  res.render(`blog/blogList`, {message,user,userId});
};


export default {
    getblogList,
};