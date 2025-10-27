import useTitle from '@/hooks/useTitle';
import EnhancedProfile from '@/components/profile/EnhancedProfile';
import { ShieldTick } from 'iconsax-react';

const AdminProfile = () => {
  useTitle("Mon Profil - Administrateur");

  const RoleIconWithColor = (props: any) => <ShieldTick {...props} color="#DC2626" />;

  return (
    <EnhancedProfile
      roleLabel="Administrateur"
      roleColor="text-red-600"
      roleIcon={RoleIconWithColor}
      bannerGradient="bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500"
    />
  );
};

export default AdminProfile;
