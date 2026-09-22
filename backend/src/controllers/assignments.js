import { query, pool } from "../config/db.js";

const assignmentAccessSql = `
  (a.target_all OR EXISTS(
    SELECT 1 FROM assignment_groups ag
    JOIN group_members gm ON gm.group_id=ag.group_id
    WHERE ag.assignment_id=a.id AND gm.student_id=$1
  ))`;

export async function listAssignments(req, res) {
  if (req.user.role === "admin") {
    const r = await query(`
      SELECT a.*, c.name course_name, c.code course_code,
             (SELECT COUNT(DISTINCT cs.student_id)
              FROM course_students cs
              WHERE cs.course_id=a.course_id
              AND (a.target_all OR EXISTS(
                SELECT 1 FROM assignment_groups ag
                JOIN group_members gm ON gm.group_id=ag.group_id
                WHERE ag.assignment_id=a.id AND gm.student_id=cs.student_id
              )))::int AS total_students,
             (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id AND s.confirmed)::int AS confirmed_count
      FROM assignments a
      JOIN courses c ON c.id=a.course_id
      WHERE a.created_by=$1
      ORDER BY a.due_date ASC`, [req.user.id]);
    return res.json(r.rows);
  }

  const r = await query(`
    SELECT a.*, c.name course_name, c.code course_code,
      ${assignmentAccessSql} AS assigned,
      CASE WHEN a.submission_type='group' THEN (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id AND s.group_id IN (SELECT group_id FROM group_members WHERE student_id=$1) AND s.confirmed)::int
           ELSE (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$1 AND s.confirmed)::int END AS confirmed_count,
      CASE WHEN a.submission_type='group' THEN (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id IN (SELECT group_id FROM group_members WHERE student_id=$1))::int ELSE 1 END AS total_students,
      EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$1 AND s.confirmed=true) AS student_confirmed,
      EXISTS(SELECT 1 FROM groups g JOIN group_members gm ON gm.group_id=g.id WHERE gm.student_id=$1 AND g.leader_id=$1) AS is_group_leader
    FROM assignments a
    JOIN courses c ON c.id=a.course_id
    JOIN course_students cs ON cs.course_id=c.id AND cs.student_id=$1
    ORDER BY a.due_date ASC`, [req.user.id]);
  res.json(r.rows);
}

export async function createAssignment(req, res) {
  const { title, description, dueDate, oneDriveLink, targetAll=false, groupIds=[], courseId, submissionType="group" } = req.body;
  if (!title || !dueDate || !oneDriveLink || !courseId) return res.status(400).json({ message: "Course, title, due date and OneDrive link are required" });
  if (!["individual","group"].includes(submissionType)) return res.status(400).json({ message: "Invalid submission type" });
  const owner = await query("SELECT id FROM courses WHERE id=$1 AND professor_id=$2", [courseId, req.user.id]);
  if (!owner.rowCount) return res.status(403).json({ message: "You can only use your own courses" });
  if (!targetAll && !groupIds.length) return res.status(400).json({ message: "Select at least one group or assign to all students" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const a = await client.query(`
      INSERT INTO assignments(title,description,due_date,onedrive_link,created_by,target_all,course_id,submission_type)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title.trim(), description?.trim() || "", dueDate, oneDriveLink, req.user.id, targetAll, courseId, submissionType]);
    for (const gid of targetAll ? [] : groupIds) {
      const valid = await client.query(`SELECT 1 FROM groups g WHERE g.id=$1 AND EXISTS(SELECT 1 FROM group_members gm JOIN course_students cs ON cs.student_id=gm.student_id WHERE gm.group_id=g.id AND cs.course_id=$2)`, [gid, courseId]);
      if (valid.rowCount) await client.query("INSERT INTO assignment_groups(assignment_id,group_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [a.rows[0].id, gid]);
    }
    await client.query("COMMIT");
    res.status(201).json(a.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ message: "Could not create assignment" });
  } finally { client.release(); }
}

export async function updateAssignment(req, res) {
  const { title, description, dueDate, oneDriveLink, targetAll=false, groupIds=[], courseId, submissionType="group" } = req.body;
  if (!["individual","group"].includes(submissionType)) return res.status(400).json({ message: "Invalid submission type" });
  const owner = await query("SELECT id FROM courses WHERE id=$1 AND professor_id=$2", [courseId, req.user.id]);
  if (!owner.rowCount) return res.status(403).json({ message: "Course not found" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const a = await client.query(`UPDATE assignments SET title=$1,description=$2,due_date=$3,onedrive_link=$4,target_all=$5,course_id=$6,submission_type=$7,updated_at=NOW() WHERE id=$8 AND created_by=$9 RETURNING *`, [title.trim(), description?.trim()||"", dueDate, oneDriveLink, targetAll, courseId, submissionType, req.params.id, req.user.id]);
    if (!a.rowCount) throw Object.assign(new Error("Assignment not found"), { status:404 });
    await client.query("DELETE FROM assignment_groups WHERE assignment_id=$1", [req.params.id]);
    for (const gid of targetAll ? [] : groupIds) await client.query("INSERT INTO assignment_groups(assignment_id,group_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.params.id, gid]);
    await client.query("COMMIT");
    res.json(a.rows[0]);
  } catch(e) { await client.query("ROLLBACK"); res.status(e.status||400).json({message:e.message}); }
  finally { client.release(); }
}

export async function studentProgress(req, res) {
  const r = await query(`
    SELECT a.id,a.title,a.due_date,a.submission_type,a.course_id,c.name course_name,
      CASE WHEN a.submission_type='group' THEN g.id ELSE NULL END group_id,
      CASE WHEN a.submission_type='group' THEN g.name ELSE NULL END group_name,
      CASE WHEN a.submission_type='group' THEN g.leader_id ELSE NULL END leader_id,
      CASE WHEN a.submission_type='group' THEN (SELECT COUNT(*) FROM group_members x WHERE x.group_id=g.id) ELSE 1 END::int AS total_members,
      CASE WHEN a.submission_type='group' THEN (SELECT COUNT(*) FROM submissions s2 WHERE s2.assignment_id=a.id AND s2.group_id=g.id AND s2.confirmed)
           ELSE (SELECT COUNT(*) FROM submissions s2 WHERE s2.assignment_id=a.id AND s2.student_id=$1 AND s2.confirmed) END::int AS confirmed_members
    FROM assignments a
    JOIN courses c ON c.id=a.course_id
    JOIN course_students cs ON cs.course_id=c.id AND cs.student_id=$1
    LEFT JOIN group_members gm ON gm.student_id=$1
    LEFT JOIN groups g ON g.id=gm.group_id
    WHERE ${assignmentAccessSql}
    ORDER BY a.due_date`, [req.user.id]);
  res.json(r.rows);
}

export async function deleteAssignment(req, res) {
  const r = await query("DELETE FROM assignments WHERE id=$1 AND created_by=$2 RETURNING id", [req.params.id, req.user.id]);
  if (!r.rowCount) return res.status(404).json({ message: "Assignment not found" });
  res.json({ message: "Assignment deleted successfully" });
}
