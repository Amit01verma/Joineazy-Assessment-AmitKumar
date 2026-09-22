import { query, pool } from "../config/db.js";

export async function myGroup(req, res) {
  const r = await query(`SELECT g.id,g.name,g.created_by,g.leader_id,g.created_at,
    json_agg(json_build_object('id',u.id,'name',u.name,'email',u.email,'isLeader',u.id=g.leader_id) ORDER BY u.name) AS members
    FROM groups g JOIN group_members gm ON gm.group_id=g.id JOIN users u ON u.id=gm.student_id
    WHERE g.id IN (SELECT group_id FROM group_members WHERE student_id=$1)
    GROUP BY g.id`, [req.user.id]);
  res.json(r.rows[0] || null);
}

export async function createGroup(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Group name is required" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT 1 FROM group_members WHERE student_id=$1", [req.user.id]);
    if (existing.rowCount) throw Object.assign(new Error("You are already in a group"), { status:409 });
    const g = await client.query("INSERT INTO groups(name,created_by,leader_id) VALUES($1,$2,$2) RETURNING *", [name.trim(), req.user.id]);
    await client.query("INSERT INTO group_members(group_id,student_id) VALUES($1,$2)", [g.rows[0].id, req.user.id]);
    await client.query("COMMIT"); res.status(201).json(g.rows[0]);
  } catch(e) { await client.query("ROLLBACK"); res.status(e.status||500).json({message:e.message||"Could not create group"}); }
  finally { client.release(); }
}

export async function addMember(req, res) {
  const { email, studentId } = req.body;
  if (!email && !studentId) return res.status(400).json({message:"Student email or ID is required"});
  const g = await query("SELECT g.* FROM groups g JOIN group_members gm ON gm.group_id=g.id WHERE gm.student_id=$1", [req.user.id]);
  if (!g.rowCount) return res.status(400).json({ message:"Create or join a group first" });
  if (g.rows[0].leader_id !== req.user.id) return res.status(403).json({ message:"Only the group leader can add members" });
  const u = await query("SELECT id,name,email FROM users WHERE " + (email ? "email=$1 AND role='student'" : "id=$1 AND role='student'"), [email ? email.toLowerCase() : Number(studentId)]);
  if (!u.rowCount) return res.status(404).json({message:"Student not found"});
  if (u.rows[0].id === req.user.id) return res.status(400).json({message:"You are already in this group"});
  const already = await query("SELECT 1 FROM group_members WHERE student_id=$1", [u.rows[0].id]);
  if (already.rowCount) return res.status(409).json({message:"Student already belongs to a group"});
  await query("INSERT INTO group_members(group_id,student_id) VALUES($1,$2)", [g.rows[0].id,u.rows[0].id]);
  res.status(201).json(u.rows[0]);
}

export async function listGroups(req,res){
  const r=await query(`SELECT g.id,g.name,g.leader_id,COUNT(gm.student_id)::int member_count,
    json_agg(json_build_object('id',u.id,'name',u.name,'email',u.email,'isLeader',u.id=g.leader_id)) FILTER(WHERE u.id IS NOT NULL) members
    FROM groups g LEFT JOIN group_members gm ON gm.group_id=g.id LEFT JOIN users u ON u.id=gm.student_id
    GROUP BY g.id ORDER BY g.id DESC`);
  res.json(r.rows);
}
