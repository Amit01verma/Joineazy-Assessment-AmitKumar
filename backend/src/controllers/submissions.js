import { query } from "../config/db.js";
export async function confirmSubmission(req, res) {
  const { assignmentId } = req.params;
  const g = await query(
    "SELECT group_id FROM group_members WHERE student_id=$1",
    [req.user.id],
  );
  if (!g.rowCount)
    return res.status(400).json({ message: "You are not in a group" });
  const assigned = await query(
    `SELECT a.id FROM assignments a WHERE a.id=$1 AND (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=$2))`,
    [assignmentId, g.rows[0].group_id],
  );
  if (!assigned.rowCount)
    return res
      .status(403)
      .json({ message: "Assignment is not assigned to your group" });
  const r = await query(
    `INSERT INTO submissions(assignment_id,group_id,student_id,confirmed,confirmed_at) VALUES($1,$2,$3,true,NOW()) ON CONFLICT(assignment_id,student_id) DO UPDATE SET confirmed=true,confirmed_at=NOW() RETURNING *`,
    [assignmentId, g.rows[0].group_id, req.user.id],
  );
  res.json(r.rows[0]);
}
export async function mySubmissions(req, res) {
  const r = await query(
    "SELECT * FROM submissions WHERE student_id=$1 ORDER BY confirmed_at DESC",
    [req.user.id],
  );
  res.json(r.rows);
}
