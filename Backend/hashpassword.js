// hashPassword.js
import bcrypt from "bcryptjs";

const password = "MasterPassword123"; // change to your password

async function hashPassword() {
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
}

hashPassword();
