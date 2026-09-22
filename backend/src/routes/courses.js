import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import { listCourses, createCourse, updateCourse, enrollStudent, courseAssignments } from "../controllers/courses.js";

const r = Router();
r.use(auth);
r.get("/", listCourses);
r.get("/:id/assignments", courseAssignments);
r.post("/", role("admin"), createCourse);
r.put("/:id", role("admin"), updateCourse);
r.post("/:id/enroll", role("admin"), enrollStudent);
export default r;
