import React from 'react';
import { Link } from 'react-router-dom';
import { SearchNormal1 } from 'iconsax-react';
import { Exam, GraduationCap, Student, Cube, Eye, VideoCamera, Play, Atom, PuzzlePiece } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import useTitle from '@/hooks/useTitle';

const NotFound: React.FC = () => {
  useTitle("Page introuvable");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-lg animate-bounce">
              <SearchNormal1
                color="#3B82F6"
                size={48}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#212121]">
            Page introuvable
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed px-4">
            Oups ! La page que vous cherchez semble avoir disparu. 
            Retournons ensemble vers votre parcours d'apprentissage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button
              className={cn(
                "inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              )}
            >
              <span>Retour à l'accueil</span>
            </Button>
          </Link>

          <Button
            onClick={() => window.history.back()}
            className={cn(
              "inline-flex items-center space-x-2 border border-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-50 hover:text-blue-600 transition-all"
            )}
          >
            <span>Retour en arrière</span>
          </Button>
        </div>
      </div>

      {/* Floating Elements - Hidden on mobile for better performance */}
      <div className="hidden md:block fixed top-20 left-10 opacity-10 animate-float">
        <GraduationCap color="#3B82F6" size={64} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed bottom-70 left-90 opacity-10 animate-float">
        <Exam color="#3B82F6" size={64} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed top-70 right-90 opacity-10 animate-float">
        <Student color="#3B82F6" size={64} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed bottom-20 right-10 opacity-10 animate-float-delayed">
        <SearchNormal1 color="#3B82F6" size={48} className="text-blue-600" />
      </div>
      
      {/* 3D Related Floating Icons */}
      <div className="hidden md:block fixed top-32 right-20 opacity-10 animate-float">
        <Cube color="#3B82F6" size={56} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed bottom-40 left-20 opacity-10 animate-float-delayed">
        <Eye color="#3B82F6" size={52} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed top-60 left-96 opacity-10 animate-float">
        <VideoCamera color="#3B82F6" size={48} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed bottom-96 right-40 opacity-10 animate-float-delayed">
        <Play color="#3B82F6" size={44} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed top-96 left-40 opacity-10 animate-float">
        <Atom color="#3B82F6" size={50} className="text-blue-600" />
      </div>
      <div className="hidden md:block fixed bottom-32 right-96 opacity-10 animate-float-delayed">
        <PuzzlePiece color="#3B82F6" size={46} className="text-blue-600" />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-20px); 
          }
        }

        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-15px); 
          }
        }

        @keyframes ring {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-ring {
          animation: ring 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;