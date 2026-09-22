import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { signToken } from "../utils/token.js";

export async function register(req,res){
  try {
    const name=req.body.name?.trim(); const email=req.body.email?.trim().toLowerCase(); const password=req.body.password;
    if(!name || !email || !password) return res.status(400).json({message:"Name, email and password are required"});
    if(name.length<2) return res.status(400).json({message:"Name must be at least 2 characters"});
    if(password.length<8) return res.status(400).json({message:"Password must be at least 8 characters"});
    const exists=await query("SELECT id FROM users WHERE email=$1",[email]);
    if(exists.rowCount) return res.status(409).json({message:"Email already registered"});
    const hash=await bcrypt.hash(password,10);
    const r=await query("INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'student') RETURNING id,name,email,role",[name,email,hash]);
    res.status(201).json({user:r.rows[0],token:signToken(r.rows[0])});
  } catch(e){console.error(e);res.status(500).json({message:"Registration failed"});}
}
export async function login(req,res){
  try{
    const email=req.body.email?.trim().toLowerCase(); const password=req.body.password;
    if(!email || !password) return res.status(400).json({message:"Email and password are required"});
    const r=await query("SELECT * FROM users WHERE email=$1",[email]);
    if(!r.rowCount || !(await bcrypt.compare(password,r.rows[0].password_hash))) return res.status(401).json({message:"Invalid email or password"});
    const u=r.rows[0]; const safe={id:u.id,name:u.name,email:u.email,role:u.role};
    res.json({user:safe,token:signToken(safe)});
  }catch(e){console.error(e);res.status(500).json({message:"Login failed"});}
}
