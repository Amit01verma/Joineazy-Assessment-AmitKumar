import { query, pool } from "../config/db.js";
export async function listAssignments(req, res) {
  const r = await query(
    `SELECT a.*, CASE WHEN a.target_all THEN true WHEN EXISTS(SELECT 1 FROM assignment_groups ag JOIN group_members gm ON gm.group_id=ag.group_id WHERE ag.assignment_id=a.id AND gm.student_id=$1) THEN true ELSE false END assigned, (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id AND s.confirmed=true AND s.group_id IN (SELECT group_id FROM group_members WHERE student_id=$1))::int confirmed_count, EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$1 AND s.confirmed=true) student_confirmed FROM assignments a ORDER BY a.due_date ASC`,
    [req.user.id],
  );
  res.json(r.rows);
}
export async function createAssignment(req, res) {
  const {
    title,
    description,
    dueDate,
    oneDriveLink,
    targetAll = false,
    groupIds = [],
  } = req.body;
  if (!title || !dueDate || !oneDriveLink)
    return res
      .status(400)
      .json({ message: "Title, due date and OneDrive link are required" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const a = await client.query(
      "INSERT INTO assignments(title,description,due_date,onedrive_link,created_by,target_all) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, description || "", dueDate, oneDriveLink, req.user.id, targetAll],
    );
    for (const gid of targetAll ? [] : groupIds)
      await client.query(
        "INSERT INTO assignment_groups(assignment_id,group_id) VALUES($1,$2)",
        [a.rows[0].id, gid],
      );
    await client.query("COMMIT");
    res.status(201).json(a.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Could not create assignment" });
  } finally {
    client.release();
  }
}
export async function updateAssignment(req, res) {
  const {
    title,
    description,
    dueDate,
    oneDriveLink,
    targetAll = false,
    groupIds = [],
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const a = await client.query(
      "UPDATE assignments SET title=$1,description=$2,due_date=$3,onedrive_link=$4,target_all=$5,updated_at=NOW() WHERE id=$6 AND created_by=$7 RETURNING *",
      [
        title,
        description || "",
        dueDate,
        oneDriveLink,
        targetAll,
        req.params.id,
        req.user.id,
      ],
    );
    if (!a.rowCount) throw new Error("Assignment not found");
    await client.query("DELETE FROM assignment_groups WHERE assignment_id=$1", [
      req.params.id,
    ]);
    for (const gid of targetAll ? [] : groupIds)
      await client.query(
        "INSERT INTO assignment_groups(assignment_id,group_id) VALUES($1,$2)",
        [req.params.id, gid],
      );
    await client.query("COMMIT");
    res.json(a.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: e.message });
  } finally {
    client.release();
  }
}
export async function studentProgress(req, res) {
  const r = await query(
    `SELECT a.id,a.title,a.due_date,g.id group_id,g.name group_name,COUNT(gm.student_id)::int total_members,COUNT(s.id) FILTER(WHERE s.confirmed)::int confirmed_members FROM assignments a JOIN group_members gm ON gm.student_id=$1 JOIN groups g ON g.id=gm.group_id LEFT JOIN submissions s ON s.assignment_id=a.id AND s.group_id=g.id AND s.confirmed=true WHERE (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=g.id)) GROUP BY a.id,g.id ORDER BY a.due_date`,
    [req.user.id],
  );
  res.json(r.rows);
}
