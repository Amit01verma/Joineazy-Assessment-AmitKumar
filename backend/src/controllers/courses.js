import { query, pool } from "../config/db.js";

export async function listCourses(req, res) {
  if (req.user.role === "admin") {
    const r = await query(`
      SELECT c.id, c.name, c.code, c.description, c.created_at,
             COUNT(DISTINCT cs.student_id)::int AS student_count,
             COUNT(DISTINCT a.id)::int AS assignment_count
      FROM courses c
      LEFT JOIN course_students cs ON cs.course_id = c.id
      LEFT JOIN assignments a ON a.course_id = c.id
      WHERE c.professor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`, [req.user.id]);
    return res.json(r.rows);
  }

  const r = await query(`
    SELECT c.id, c.name, c.code, c.description,
           COUNT(DISTINCT a.id)::int AS assignment_count
    FROM courses c
    JOIN course_students cs ON cs.course_id = c.id AND cs.student_id = $1
    LEFT JOIN assignments a ON a.course_id = c.id
    GROUP BY c.id
    ORDER BY c.name`, [req.user.id]);
  res.json(r.rows);
}

export async function createCourse(req, res) {
  const { name, code, description = "" } = req.body;
  if (!name?.trim() || !code?.trim()) {
    return res.status(400).json({ message: "Course name and code are required" });
  }
  try {
    const r = await query(
      `INSERT INTO courses(name, code, description, professor_id)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [name.trim(), code.trim().toUpperCase(), description.trim(), req.user.id],
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ message: "Course code already exists" });
    throw e;
  }
}

export async function updateCourse(req, res) {
  const { name, code, description = "" } = req.body;
  const r = await query(
    `UPDATE courses
     SET name=$1, code=$2, description=$3
     WHERE id=$4 AND professor_id=$5
     RETURNING *`,
    [name?.trim(), code?.trim()?.toUpperCase(), description.trim(), req.params.id, req.user.id],
  );
  if (!r.rowCount) return res.status(404).json({ message: "Course not found" });
  res.json(r.rows[0]);
}

export async function enrollStudent(req, res) {
  const { studentId } = req.body;
  const student = await query("SELECT id FROM users WHERE id=$1 AND role='student'", [studentId]);
  if (!student.rowCount) return res.status(404).json({ message: "Student not found" });
  const course = await query("SELECT id FROM courses WHERE id=$1 AND professor_id=$2", [req.params.id, req.user.id]);
  if (!course.rowCount) return res.status(404).json({ message: "Course not found" });
  await query("INSERT INTO course_students(course_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.params.id, studentId]);
  res.status(201).json({ message: "Student enrolled successfully" });
}

export async function courseAssignments(req, res) {
  const course = await query("SELECT id,name,code FROM courses WHERE id=$1", [req.params.id]);
  if (!course.rowCount) return res.status(404).json({ message: "Course not found" });

  if (req.user.role === "admin") {
    const owner = await query("SELECT id FROM courses WHERE id=$1 AND professor_id=$2", [req.params.id, req.user.id]);
    if (!owner.rowCount) return res.status(403).json({ message: "Access denied" });
  } else {
    const enrolled = await query("SELECT 1 FROM course_students WHERE course_id=$1 AND student_id=$2", [req.params.id, req.user.id]);
    if (!enrolled.rowCount) return res.status(403).json({ message: "You are not enrolled in this course" });
  }

  const r = req.user.role === "admin"
    ? await query(`SELECT a.id,a.title,a.description,a.due_date,a.onedrive_link,a.target_all,a.submission_type,a.course_id FROM assignments a WHERE a.course_id=$1 ORDER BY a.due_date ASC`, [req.params.id])
    : await query(`SELECT a.id,a.title,a.description,a.due_date,a.onedrive_link,a.target_all,a.submission_type,a.course_id FROM assignments a WHERE a.course_id=$1 AND (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag JOIN group_members gm ON gm.group_id=ag.group_id WHERE ag.assignment_id=a.id AND gm.student_id=$2)) ORDER BY a.due_date ASC`, [req.params.id, req.user.id]);
  res.json({ course: course.rows[0], assignments: r.rows });
}
