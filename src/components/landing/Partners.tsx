import { Buildings } from '@phosphor-icons/react';

const partners = [
  { name: 'TechCorp', logo: 'TC' },
  { name: 'DesignStudio', logo: 'DS' },
  { name: 'Creative Labs', logo: 'CL' },
  { name: 'Digital Agency', logo: 'DA' },
  { name: 'Innovation Hub', logo: 'IH' },
  { name: 'Media Group', logo: 'MG' },
  { name: 'Art Academy', logo: 'AA' },
  { name: 'Tech Institute', logo: 'TI' },
  { name: 'Design Co', logo: 'DC' },
  { name: 'Studio 3D', logo: 'S3' },
];

export const Partners = () => {
  // Dupliquer les partenaires pour le défilement infini
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Buildings size={16} weight="fill" />
            <span>Ils nous font confiance</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos partenaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez des milliers d'organisations qui forment leurs équipes avec 3D E-Learning
          </p>
        </div>

        {/* Scrolling Partners Carousel */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 mx-4"
              >
                <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group w-48 h-32">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-purple-600">
                        {partner.logo}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                      {partner.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600">Entreprises partenaires</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">150,000+</div>
            <div className="text-gray-600">Employés formés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">45+</div>
            <div className="text-gray-600">Pays couverts</div>
          </div>
        </div>
      </div>

      {/* Add CSS animation for infinite scroll */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
