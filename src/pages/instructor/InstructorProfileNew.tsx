import useTitle from '@/hooks/useTitle';
import EnhancedProfile from '@/components/profile/EnhancedProfile';
import { Teacher } from 'iconsax-react';

const InstructorProfile = () => {
  useTitle("Mon Profil - Instructeur");

  const RoleIconWithColor = (props: any) => <Teacher {...props} color="#16A34A" />;

  return (
    <EnhancedProfile
      roleLabel="Instructeur"
      roleColor="text-green-600"
      roleIcon={RoleIconWithColor}
      bannerGradient="bg-gradient-to-r from-green-500 via-teal-600 to-cyan-500"
    />
  );
};

export default InstructorProfile;
