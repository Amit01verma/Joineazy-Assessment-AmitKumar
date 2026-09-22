import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Protected from "./components/Protected";
import { Login, Register } from "./pages/Auth";
import { StudentDashboard, CoursesPage, CoursePage, GroupPage, AssignmentsPage, AssignmentDetails } from "./pages/Student";
import { AdminDashboard, AdminAssignments, AdminGroups } from "./pages/Admin";
import "./index.css";
function Root(){const {user}=useAuth();return <Navigate to={user?(user.role==="admin"?"/admin":"/dashboard"):"/login"} replace/>}
function IdPage({type}){const {id}=useParams();return type==="course"?<CoursePage id={id}/>:<AssignmentDetails id={id}/>;}
export default function App(){return <AuthProvider><BrowserRouter><Routes>
<Route path="/" element={<Root/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
<Route path="/dashboard" element={<Protected role="student"><StudentDashboard/></Protected>}/><Route path="/courses" element={<Protected role="student"><CoursesPage/></Protected>}/><Route path="/courses/:id" element={<Protected role="student"><IdPage type="course"/></Protected>}/><Route path="/group" element={<Protected role="student"><GroupPage/></Protected>}/><Route path="/assignments" element={<Protected role="student"><AssignmentsPage/></Protected>}/><Route path="/assignments/:id" element={<Protected role="student"><IdPage/></Protected>}/>
<Route path="/admin" element={<Protected role="admin"><AdminDashboard/></Protected>}/><Route path="/admin/assignments" element={<Protected role="admin"><AdminAssignments/></Protected>}/><Route path="/admin/groups" element={<Protected role="admin"><AdminGroups/></Protected>}/>
<Route path="*" element={<Root/>}/></Routes></BrowserRouter></AuthProvider>}
