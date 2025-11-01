import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { FeaturedCourses } from '../../components/landing/FeaturedCourses';
import { OrganizationsFeature } from '../../components/landing/OrganizationsFeature';
import { AIFeatures } from '../../components/landing/AIFeatures';
import { Partners } from '../../components/landing/Partners';
import { Testimonials } from '../../components/landing/Testimonials';
import { Pricing } from '../../components/landing/Pricing';
import { Contact } from '../../components/landing/Contact';
import { Newsletter } from '../../components/landing/Newsletter';
import { Footer } from '../../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FeaturedCourses />
      <OrganizationsFeature />
      <AIFeatures />
      <Partners />
      <Testimonials />
      <Pricing />
      <Newsletter />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;
