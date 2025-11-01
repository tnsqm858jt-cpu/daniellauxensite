import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import FocusPage from './pages/FocusPage';
import MetasPage from './pages/MetasPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './components/AppShell';

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '3rem', fontSize: '1.25rem' }}>Carregando StoryLab…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/focus/daniel" element={<FocusPage board="daniel" />} />
        <Route path="/focus/lauxen" element={<FocusPage board="lauxen" />} />
        <Route path="/metas" element={<MetasPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/focus/daniel" replace />} />
      </Routes>
    </AppShell>
  );
};

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  </AuthProvider>
);

export default App;
