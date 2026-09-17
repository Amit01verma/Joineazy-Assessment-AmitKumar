import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import {
  confirmSubmission,
  mySubmissions,
} from "../controllers/submissions.js";
const r = Router();
r.use(auth);
r.get("/mine", role("student"), mySubmissions);
r.post("/:assignmentId/confirm", role("student"), confirmSubmission);
export default r;
