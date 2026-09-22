import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

const run=async()=>{
  const adminHash=await bcrypt.hash("Admin@123",10);
  const admin=await pool.query(`INSERT INTO users(name,email,password_hash,role) VALUES('Joineazy Professor','admin@joineazy.local',$1,'admin') ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,[adminHash]);
  const sh=await bcrypt.hash("Student@123",10);
  for(const [name,email] of [["Amit Student","amit@joineazy.local"],["Rahul Student","rahul@joineazy.local"],["Priya Student","priya@joineazy.local"]])
    await pool.query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'student') ON CONFLICT(email) DO NOTHING`,[name,email,sh]);
  const course=await pool.query(`INSERT INTO courses(name,code,description,professor_id) VALUES('Full Stack Development','FSD-101','React, Node.js, Express and PostgreSQL', $1) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id`,[admin.rows[0].id]);
  await pool.query(`INSERT INTO course_students(course_id,student_id) SELECT $1,id FROM users WHERE role='student' ON CONFLICT DO NOTHING`,[course.rows[0].id]);
  await pool.query(`UPDATE groups SET leader_id=created_by WHERE leader_id IS NULL`);
  console.log("Seed complete. Admin: admin@joineazy.local / Admin@123");
  await pool.end();
};
run().catch(e=>{console.error(e);process.exit(1);});
