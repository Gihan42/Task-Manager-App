import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Boards } from './pages/Boards';
import { Board } from './pages/Board';
import { Team } from './pages/TeamPage';

import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="boards" element={<Boards />} />
        <Route path="board/:boardId" element={<Board />} />
        <Route path="team" element={<Team />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
