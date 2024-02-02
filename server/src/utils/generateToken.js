import crypto from "crypto";
import { db } from "../db.js";
import { setResetToken } from "../../db/queries/auth.queries.js";

const generateResetToken = async (email) => {
  console.log("\n\n...resetToken() called");

    // generate the token.
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("\n\nToken generated ", resetToken)

    // encript the token.
    crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log("\n\nToken enctypted ", resetToken)

    // store the token in DB.
    const [savedToken] = await db.promise().execute(setResetToken, [resetToken, email]);
    console.log(`\n\nToken stored in db`);

    return resetToken; // Return the plain token for use
  }; 

export default generateResetToken;