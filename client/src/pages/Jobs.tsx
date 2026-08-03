import { useAuth } from '../context/AuthContext';
import { JobFeed } from './condidate/JobFeed';
import { JobManagement } from './employer/JobManagement';

export const Jobs = () => {
  const { user } = useAuth();

  if (user?.role === 'candidate') {
    return <JobFeed />;
  }

  return <JobManagement />;
};