import { useAuth } from '../context/AuthContext';
import { CandidateProfile } from './CandidateProfile';
import { EmployerProfile } from './EmployerProfile';

export const Profile = () => {
  const { user } = useAuth();

  if (user?.role === 'employer') {
    return <EmployerProfile />;
  }

  return <CandidateProfile />;
};