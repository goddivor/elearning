import { Hero } from '../../components/landing/Hero';
import { FeaturedCourses } from '../../components/landing/FeaturedCourses';
import { OrganizationsFeature } from '../../components/landing/OrganizationsFeature';
import { AIFeatures } from '../../components/landing/AIFeatures';
import { Partners } from '../../components/landing/Partners';
import { Testimonials } from '../../components/landing/Testimonials';
import { Pricing } from '../../components/landing/Pricing';
import { Contact } from '../../components/landing/Contact';
import { Newsletter } from '../../components/landing/Newsletter';
import { useGoogleOneTap } from '../../hooks/useGoogleOneTap';

const LandingPage = () => {
  // Initialize Google One Tap
  useGoogleOneTap({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    autoSelect: true,
    cancelOnTapOutside: false,
    onSuccess: () => {
      console.log('Google One Tap authentication successful');
    },
    onError: (error) => {
      console.error('Google One Tap authentication error:', error);
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <FeaturedCourses />
      <OrganizationsFeature />
      <AIFeatures />
      <Partners />
      <Testimonials />
      <Pricing />
      <Newsletter />
      <Contact />
    </div>
  );
};

export default LandingPage;
