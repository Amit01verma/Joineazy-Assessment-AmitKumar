import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import {
  listAssignments,
  createAssignment,
  updateAssignment,
  studentProgress,
  deleteAssignment,
} from "../controllers/assignments.js";
const r = Router();
r.use(auth);
r.get("/", listAssignments);
r.post("/", role("admin"), createAssignment);
r.put("/:id", role("admin"), updateAssignment);
r.delete("/:id", role("admin"), deleteAssignment);
r.get("/progress", role("student"), studentProgress);
export default r;
