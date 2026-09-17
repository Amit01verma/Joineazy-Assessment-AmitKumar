import { query } from "../config/db.js";
export async function analytics(req, res) {
  const a = await query(
    "SELECT COUNT(*)::int count FROM assignments WHERE created_by=$1",
    [req.user.id],
  );
  const g = await query("SELECT COUNT(*)::int count FROM groups");
  const totals = await query(
    `SELECT COUNT(*)::int total, COUNT(s.id) FILTER(WHERE s.confirmed)::int confirmed FROM assignments a JOIN group_members gm ON (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=gm.group_id)) LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=gm.student_id WHERE a.created_by=$1`,
    [req.user.id],
  );
  const byAssignment = await query(
    `SELECT a.id,a.title,COUNT(gm.student_id)::int total,COUNT(s.id) FILTER(WHERE s.confirmed)::int confirmed FROM assignments a LEFT JOIN group_members gm ON (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=gm.group_id)) LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=gm.student_id WHERE a.created_by=$1 GROUP BY a.id ORDER BY a.due_date`,
    [req.user.id],
  );
  res.json({
    assignments: a.rows[0].count,
    groups: g.rows[0].count,
    confirmed: totals.rows[0].confirmed,
    total: totals.rows[0].total,
    byAssignment: byAssignment.rows,
  });
}
export async function submissions(req, res) {
  const r = await query(
    `SELECT a.title,g.name group_name,u.name student_name,u.email,COALESCE(s.confirmed,false) confirmed,s.confirmed_at FROM assignments a JOIN group_members gm ON (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=gm.group_id)) JOIN groups g ON g.id=gm.group_id JOIN users u ON u.id=gm.student_id LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=gm.student_id WHERE a.created_by=$1 ORDER BY a.due_date,g.name,u.name`,
    [req.user.id],
  );
  res.json(r.rows);
}
