import useTitle from '@/hooks/useTitle';
import EnhancedProfile from '@/components/profile/EnhancedProfile';
import { Profile2User } from 'iconsax-react';

const StudentProfile = () => {
  useTitle("Mon Profil");

  const RoleIconWithColor = (props: any) => <Profile2User {...props} color="#2563EB" />;

  return (
    <EnhancedProfile
      roleLabel="Étudiant"
      roleColor="text-blue-600"
      roleIcon={RoleIconWithColor}
      bannerGradient="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"
    />
  );
};

export default StudentProfile;
