async function checkUserExistenceById(id) {
  try {
    const [existingUser] = await pool.query(fetchUserByField("id"), [id]);
    console.log(
      "\n\nuser fetcher from id",
      existingUser && existingUser[0] && existingUser[0]["id"]
    );

    if (!existingUser || existingUser.length === 0) {
      return { status: "not_found", message: "User ID not found" };
    }

    // If user exists, you can return the user data or perform additional actions.
    return { status: "found", user: existingUser[0] };
  } catch (error) {
    // Handle potential errors
    console.error("Error checking user existence:", error);
    return {
      status: "error",
      message: "An error occurred while checking user existence",
    };
  }
}

function userCheck(userId) {
  (async () => {
    const result = await checkUserExistenceById(userId);

    if (result.status === "not_found") {
      console.log("\n\n user not found");
    } else if (result.status === "found") {
      console.log("\n\n user found");
      // Do something with the found user data (result.user)
      // For example: return user data or continue with your logic
    } else {
      // Handle other potential statuses (like "error")
      console.error("Internal Server Error");
    }
  })();
}

export default checkUserExistenceById;
//performUserCheck(/*userId*/); // Invoke this function with the desired userId
