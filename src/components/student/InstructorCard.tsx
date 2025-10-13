import { Minus } from 'iconsax-react';
import Button from '@/components/ui/Button';
import { getFullFileUrl } from '@/utils/fileUtils';

interface InstructorCardProps {
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  onUnfollow: (instructorId: string) => void;
  onViewProfile: (instructorId: string) => void;
}

export const InstructorCard = ({
  instructor,
  onUnfollow,
  onViewProfile,
}: InstructorCardProps) => {
  const avatarUrl = instructor.avatar
    ? getFullFileUrl(instructor.avatar)
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 cursor-pointer"
          onClick={() => onViewProfile(instructor._id)}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${instructor.firstName} ${instructor.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {instructor.firstName?.[0]}{instructor.lastName?.[0]}
            </span>
          )}
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
            onClick={() => onViewProfile(instructor._id)}
          >
            {instructor.firstName} {instructor.lastName}
          </h3>
          <p className="text-xs text-gray-500 truncate">{instructor.email}</p>
        </div>

        {/* Bouton Unfollow */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnfollow(instructor._id)}
          className="flex items-center gap-1 flex-shrink-0"
          title="Ne plus suivre"
        >
          <Minus size={14} color="#EF4444" />
        </Button>
      </div>
    </div>
  );
};
