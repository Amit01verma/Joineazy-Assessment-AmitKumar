import { query, pool } from "../config/db.js";

export async function confirmSubmission(req, res) {
  const { assignmentId } = req.params;
  const assignment = await query(`SELECT a.*, c.id course_id FROM assignments a JOIN courses c ON c.id=a.course_id WHERE a.id=$1`, [assignmentId]);
  if (!assignment.rowCount) return res.status(404).json({ message: "Assignment not found" });
  const a = assignment.rows[0];
  const enrolled = await query("SELECT 1 FROM course_students WHERE course_id=$1 AND student_id=$2", [a.course_id, req.user.id]);
  if (!enrolled.rowCount) return res.status(403).json({ message: "You are not enrolled in this course" });

  const group = await query("SELECT g.id,g.leader_id FROM groups g JOIN group_members gm ON gm.group_id=g.id WHERE gm.student_id=$1", [req.user.id]);
  const groupRow = group.rows[0];
  if (a.submission_type === "group") {
    if (!groupRow) return res.status(400).json({ message: "You must be in a group for a group assignment" });
    if (groupRow.leader_id !== req.user.id) return res.status(403).json({ message: "Only the group leader can acknowledge a group submission" });
    const assigned = a.target_all || (await query("SELECT 1 FROM assignment_groups WHERE assignment_id=$1 AND group_id=$2", [assignmentId, groupRow.id])).rowCount;
    if (!assigned) return res.status(403).json({ message: "Assignment is not assigned to your group" });

    const members = await query("SELECT student_id FROM group_members WHERE group_id=$1", [groupRow.id]);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const member of members.rows) {
        await client.query(`INSERT INTO submissions(assignment_id,group_id,student_id,confirmed,confirmed_at) VALUES($1,$2,$3,true,NOW()) ON CONFLICT(assignment_id,student_id) DO UPDATE SET confirmed=true,confirmed_at=NOW(),group_id=EXCLUDED.group_id`, [assignmentId, groupRow.id, member.student_id]);
      }
      await client.query("COMMIT");
      return res.json({ message: "Group submission acknowledged for all members", groupAcknowledged: true });
    } catch(e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
  }

  const assigned = a.target_all || (groupRow && (await query("SELECT 1 FROM assignment_groups WHERE assignment_id=$1 AND group_id=$2", [assignmentId, groupRow.id])).rowCount);
  if (!assigned) return res.status(403).json({ message: "Assignment is not assigned to you" });
  const r = await query(`INSERT INTO submissions(assignment_id,group_id,student_id,confirmed,confirmed_at) VALUES($1,$2,$3,true,NOW()) ON CONFLICT(assignment_id,student_id) DO UPDATE SET confirmed=true,confirmed_at=NOW() RETURNING *`, [assignmentId, groupRow?.id || null, req.user.id]);
  res.json(r.rows[0]);
}

export async function mySubmissions(req, res) {
  const r = await query("SELECT * FROM submissions WHERE student_id=$1 ORDER BY confirmed_at DESC", [req.user.id]);
  res.json(r.rows);
}
