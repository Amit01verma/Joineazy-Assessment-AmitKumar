CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK(role IN ('student','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  professor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_students (
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(course_id, student_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leader_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id INT REFERENCES groups(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(group_id,student_id),
  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  onedrive_link TEXT NOT NULL,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  submission_type VARCHAR(20) NOT NULL DEFAULT 'group' CHECK(submission_type IN ('individual','group')),
  target_all BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_groups (
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  group_id INT REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY(assignment_id,group_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  group_id INT REFERENCES groups(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  UNIQUE(assignment_id,student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_students_student_id ON course_students(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_professor_id ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
