import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsContainer } from './containers/ProjectsContainer';
import { ProjectDetailContainer } from './containers/ProjectDetailContainer';
import { ProjectFinanceContainer } from './containers/ProjectFinanceContainer';
import { InvitationsContainer } from './containers/InvitationsContainer';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/projects" element={<ProjectsContainer />} />
          <Route path="/projects/:id" element={<ProjectDetailContainer />} />
          <Route path="/projects/:id/finance" element={<ProjectFinanceContainer />} />
          <Route path="/invitations" element={<InvitationsContainer />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
