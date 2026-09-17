import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import {
  myGroup,
  createGroup,
  addMember,
  listGroups,
} from "../controllers/groups.js";
const r = Router();
r.use(auth);
r.get("/mine", role("student"), myGroup);
r.post("/", role("student"), createGroup);
r.post("/members", role("student"), addMember);
r.get("/", role("admin"), listGroups);
export default r;
