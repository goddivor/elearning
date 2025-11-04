import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from '@phosphor-icons/react';

export default function ApplicationSubmitted() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Démarrer le compteur
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleReturnHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" weight="fill" />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Candidature soumise avec succès ! 🎉
          </h1>

          <p className="text-xl text-slate-600 mb-8">
            Merci pour votre intérêt à rejoindre notre équipe d'instructeurs
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200 mb-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Prochaines étapes
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Notre équipe examinera attentivement votre candidature.
                  Vous recevrez une <strong>notification</strong> dès qu'un administrateur aura validé votre profil.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
                <p>
                  <strong className="text-slate-900">Examen de votre candidature</strong>
                  <br />
                  <span className="text-sm">Notre équipe analyse vos réponses et votre profil (généralement sous 24-48h)</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <p>
                  <strong className="text-slate-900">Validation par un administrateur</strong>
                  <br />
                  <span className="text-sm">Un admin approuvera votre candidature si elle répond aux critères</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <p>
                  <strong className="text-slate-900">Notification de confirmation</strong>
                  <br />
                  <span className="text-sm">Vous recevrez une notification dès l'approbation et pourrez commencer à créer vos cours</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                💡 <strong>Conseil :</strong> Pendant ce temps, vous pouvez explorer la plateforme et voir comment les autres instructeurs organisent leurs cours !
              </p>
            </div>
          </div>
        </div>

        {/* Countdown & Actions */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-full mb-6">
            <Clock className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700 font-medium">
              Redirection automatique dans <strong className="text-blue-600">{countdown}s</strong>
            </span>
          </div>

          <button
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg group"
          >
            <span>Retourner à l'accueil</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-sm text-slate-500">
            Vous pouvez aussi consulter vos notifications dans le header 🔔
          </p>
        </div>
      </div>
    </div>
  );
}
