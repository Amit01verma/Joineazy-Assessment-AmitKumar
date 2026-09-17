import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import {
  listAssignments,
  createAssignment,
  updateAssignment,
  studentProgress,
} from "../controllers/assignments.js";
const r = Router();
r.use(auth);
r.get("/", listAssignments);
r.post("/", role("admin"), createAssignment);
r.put("/:id", role("admin"), updateAssignment);
r.get("/progress", role("student"), studentProgress);
export default r;
