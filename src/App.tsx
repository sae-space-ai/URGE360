import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { ClientDashboard } from './pages/ClientDashboard';
import { ProDashboard } from './pages/ProDashboard';
import { OpsDashboard } from './pages/OpsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const user = useStore(s => s.currentUser);
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/professional" element={<ProtectedRoute roles={['professional']}><ProDashboard /></ProtectedRoute>} />
        <Route path="/ops" element={<ProtectedRoute roles={['ops', 'admin']}><OpsDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
