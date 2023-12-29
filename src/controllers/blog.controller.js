const getblogCreate = async (req, res, next) => {
    console.log("\n\n*** getblogCreate\n\n");
    const message = req.query.message;
    const user = req.session.user || null;
  //   const userId = user.id || null;
    const userId =  null;
  
    res.render(`blog/blogCreate`, {user,userId,message});
};
const postblogCreate = async (req, res, next) => {
    console.log("\n\n*** postblogCreate\n\n");
    const message = req.query.message;
    const user = req.session.user || null;
  //   const userId = user.id || null;
    const userId =  null;
  
    res.send(`postblogCreate`);
};

const getblogList = async (req, res, next) => {
  console.log("\n\n*** getblogList\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
//   const userId = user.id || null;
  const userId =  null;

  res.render(`blog/blogList`, {message,user,userId});
};


export default {
    getblogList,
    getblogCreate,
    postblogCreate,
};