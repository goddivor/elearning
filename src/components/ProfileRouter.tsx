import { useAuth } from '@/contexts/AuthContext';
import AdminProfile from '@/pages/admin/AdminProfile';
import InstructorProfile from '@/pages/instructor/InstructorProfile';
import StudentProfile from '@/pages/student/StudentProfile';

/**
 * ProfileRouter component that redirects to the appropriate profile page
 * based on the user's role (admin, instructor, or student)
 */
const ProfileRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <AdminProfile />;
    case 'instructor':
      return <InstructorProfile />;
    case 'student':
      return <StudentProfile />;
    default:
      return <StudentProfile />; // Default to student profile
  }
};

export default ProfileRouter;
