import { useAuth } from '../context/AuthContext';
import { CandidateDashboard } from './condidate/CandidateDashboard';
import { EmployerDashboard } from './employer/EmployerDashboard';
import { AdminDashboard } from './admin/AdminDashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return null;
};