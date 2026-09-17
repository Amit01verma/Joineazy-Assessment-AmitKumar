import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import { analytics, submissions } from "../controllers/analytics.js";
const r = Router();
r.use(auth, role("admin"));
r.get("/analytics", analytics);
r.get("/submissions", submissions);
export default r;
