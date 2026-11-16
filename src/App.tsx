
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Boards } from './pages/Boards';
import { Board } from './pages/Board';
import { Team } from './pages/TeamPage';
import { ProjectFiles } from './pages/ProjectFiles';
import { Employee } from './pages/Employee';
import { LeaveType } from "./pages/LeaveType.tsx";
import { LeaveAllocate } from "./pages/leave-allocate.tsx";

import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="boards" element={<Boards />} />
        <Route path="board/:boardId" element={<Board />} />
        <Route path="project-files" element={<ProjectFiles />} />
        <Route path="team" element={<Team />} />
        <Route path="employee" element={<Employee />} />
        <Route path="leaveType" element={<LeaveType />} />
        <Route path="leaveAllocate" element={<LeaveAllocate />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
