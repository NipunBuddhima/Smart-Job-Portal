import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { Profile } from './pages/Profile';
import { Jobs } from './pages/Jobs';
import { CreateJob } from './pages/employer/CreateJob';
import { ApplyJob } from './pages/condidate/ApplyJob';
import { AppliedJobs } from './pages/condidate/AppliedJobs';
import { ApplicantTracking } from './pages/employer/ApplicantTracking';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jobs" element={<Jobs />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
            <Route path="/candidate/applied-jobs" element={<AppliedJobs />} />
            <Route path="/jobs/:jobId/apply" element={<ApplyJob />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['employer', 'admin']} />}>
            <Route path="/jobs/new" element={<CreateJob />} />
            <Route path="/jobs/:jobId/edit" element={<CreateJob />} />
            <Route path="/jobs/:jobId/applicants" element={<ApplicantTracking />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;