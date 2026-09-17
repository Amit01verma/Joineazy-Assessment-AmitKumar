import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
const run = async () => {
  const hash = await bcrypt.hash("Admin@123", 10);
  await pool.query(
    `INSERT INTO users(name,email,password_hash,role) VALUES('Joineazy Professor','admin@joineazy.local',$1,'admin') ON CONFLICT(email) DO NOTHING`,
    [hash],
  );
  const sh = await bcrypt.hash("Student@123", 10);
  for (const [name, email] of [
    ["Amit Student", "amit@joineazy.local"],
    ["Rahul Student", "rahul@joineazy.local"],
    ["Priya Student", "priya@joineazy.local"],
  ])
    await pool.query(
      `INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'student') ON CONFLICT(email) DO NOTHING`,
      [name, email, sh],
    );
  console.log("Seed complete. Admin: admin@joineazy.local / Admin@123");
  await pool.end();
};
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
