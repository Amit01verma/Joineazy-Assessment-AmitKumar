-- ============================================
-- Joineazy - Round 2 Database Migration
-- ============================================

BEGIN;

-- ============================================
-- 1. COURSES
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    professor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 2. COURSE ENROLLMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS course_students (
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (course_id, student_id)
);


-- ============================================
-- 3. GROUP LEADER
-- ============================================

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS leader_id INT REFERENCES users(id) ON DELETE SET NULL;

-- Existing groups were created by the student,
-- so use created_by as the initial leader.
UPDATE groups
SET leader_id = created_by
WHERE leader_id IS NULL;

-- Existing groups now have a leader.
ALTER TABLE groups
ALTER COLUMN leader_id SET NOT NULL;


-- ============================================
-- 4. ASSIGNMENT COURSE + SUBMISSION TYPE
-- ============================================

ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS course_id INT
REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20)
DEFAULT 'group';

-- Allow only Individual or Group.
ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_submission_type_check;

ALTER TABLE assignments
ADD CONSTRAINT assignments_submission_type_check
CHECK (submission_type IN ('individual', 'group'));


-- ============================================
-- 5. CREATE A DEFAULT COURSE
-- ============================================

INSERT INTO courses (
    name,
    code,
    description,
    professor_id
)
SELECT
    'General Development',
    'GEN-101',
    'Default course for existing assignments.',
    id
FROM users
WHERE role = 'admin'
ORDER BY id
LIMIT 1
ON CONFLICT (code) DO NOTHING;


-- ============================================
-- 6. CONNECT EXISTING ASSIGNMENTS
-- ============================================

UPDATE assignments
SET course_id = (
    SELECT id
    FROM courses
    WHERE code = 'GEN-101'
)
WHERE course_id IS NULL;


-- Existing assignments were group-based.
UPDATE assignments
SET submission_type = 'group'
WHERE submission_type IS NULL;


-- ============================================
-- 7. MAKE COURSE REQUIRED FOR ASSIGNMENTS
-- ============================================

ALTER TABLE assignments
ALTER COLUMN course_id SET NOT NULL;


-- ============================================
-- 8. ENROLL EXISTING STUDENTS
-- ============================================

INSERT INTO course_students (course_id, student_id)
SELECT
    c.id,
    u.id
FROM courses c
CROSS JOIN users u
WHERE c.code = 'GEN-101'
  AND u.role = 'student'
ON CONFLICT (course_id, student_id) DO NOTHING;


-- ============================================
-- 9. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_assignments_course_id
ON assignments(course_id);

CREATE INDEX IF NOT EXISTS idx_course_students_student_id
ON course_students(student_id);

CREATE INDEX IF NOT EXISTS idx_courses_professor_id
ON courses(professor_id);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id
ON submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_group_id
ON submissions(group_id);


COMMIT;