import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { FeaturedCourses } from '../../components/landing/FeaturedCourses';
import { Partners } from '../../components/landing/Partners';
import { Testimonials } from '../../components/landing/Testimonials';
import { Pricing } from '../../components/landing/Pricing';
import { Footer } from '../../components/landing/Footer';

export const NewLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FeaturedCourses />
      <Partners />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};
