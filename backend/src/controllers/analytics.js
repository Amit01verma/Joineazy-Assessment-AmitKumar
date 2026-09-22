import { query } from "../config/db.js";

export async function analytics(req, res) {
  const summary = await query(`
    SELECT
      (SELECT COUNT(*) FROM assignments WHERE created_by=$1)::int AS assignments,
      (SELECT COUNT(*) FROM courses WHERE professor_id=$1)::int AS courses,
      (SELECT COUNT(*) FROM groups)::int AS groups,
      (SELECT COUNT(*) FROM users WHERE role='student')::int AS students`, [req.user.id]);

  const byCourse = await query(`
    SELECT c.id,c.name,c.code,
      (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id=c.id)::int AS student_count,
      (SELECT COUNT(*) FROM assignments a WHERE a.course_id=c.id AND a.created_by=$1)::int AS assignment_count,
      COALESCE((SELECT SUM(x.total_students) FROM (
        SELECT a.id, COUNT(DISTINCT cs.student_id)::int AS total_students
        FROM assignments a
        JOIN course_students cs ON cs.course_id=c.id
        WHERE a.course_id=c.id AND a.created_by=$1
          AND (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag JOIN group_members gm ON gm.group_id=ag.group_id WHERE ag.assignment_id=a.id AND gm.student_id=cs.student_id))
        GROUP BY a.id
      ) x),0)::int AS total_submissions,
      COALESCE((SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.course_id=c.id AND a.created_by=$1 AND s.confirmed),0)::int AS confirmed_submissions
    FROM courses c
    WHERE c.professor_id=$1
    ORDER BY c.name`, [req.user.id]);

  const byAssignment = await query(`
    SELECT a.id,a.title,a.due_date,a.submission_type,c.name course_name,
      COUNT(DISTINCT cs.student_id) FILTER(WHERE a.target_all OR EXISTS(
        SELECT 1 FROM assignment_groups ag JOIN group_members gm ON gm.group_id=ag.group_id
        WHERE ag.assignment_id=a.id AND gm.student_id=cs.student_id
      ))::int AS total,
      COUNT(DISTINCT s.student_id) FILTER(WHERE s.confirmed)::int AS confirmed
    FROM assignments a
    JOIN courses c ON c.id=a.course_id
    LEFT JOIN course_students cs ON cs.course_id=c.id
    LEFT JOIN submissions s ON s.assignment_id=a.id
    WHERE a.created_by=$1
    GROUP BY a.id,c.id
    ORDER BY a.due_date`, [req.user.id]);

  res.json({ ...summary.rows[0], byCourse: byCourse.rows, byAssignment: byAssignment.rows });
}

export async function submissions(req,res){
  const status = ["pending","confirmed"].includes(req.query.status) ? req.query.status : "all";
  const params=[req.user.id];
  let statusClause="";
  if(status === "pending") statusClause="AND COALESCE(s.confirmed,false)=false";
  if(status === "confirmed") statusClause="AND s.confirmed=true";
  const r=await query(`
    SELECT a.id assignment_id,a.title,a.submission_type,a.due_date,c.name course_name,
      g.name group_name,g.leader_id,u.name student_name,u.email,
      COALESCE(s.confirmed,false) confirmed,s.confirmed_at,
      CASE WHEN s.confirmed THEN 'confirmed' ELSE 'pending' END status
    FROM assignments a
    JOIN courses c ON c.id=a.course_id
    JOIN course_students cs ON cs.course_id=c.id
    JOIN users u ON u.id=cs.student_id
    LEFT JOIN group_members gm ON gm.student_id=u.id
    LEFT JOIN groups g ON g.id=gm.group_id
    LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=u.id
    WHERE a.created_by=$1
      AND (a.target_all OR EXISTS(SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id=a.id AND ag.group_id=gm.group_id))
      ${statusClause}
    ORDER BY a.due_date,g.name,u.name`, params);
  res.json(r.rows);
}
