import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { VALIDATE_ADMIN_TOKEN } from '@/graphql/mutations/admin-access.mutations';
import { SecuritySafe, ShieldTick, Clock } from 'iconsax-react';

export default function AdminAccess() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);

  const { data, loading, error } = useQuery(VALIDATE_ADMIN_TOKEN, {
    variables: { token: token || '' },
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    if (data?.validateAdminToken) {
      const { isValid, expiresAt } = data.validateAdminToken;

      if (isValid && expiresAt) {
        // Calculer le temps restant
        const expirationTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const timeLeft = Math.floor((expirationTime - now) / 1000);

        if (timeLeft > 0) {
          setCountdown(timeLeft);

          // Rediriger vers la page de login admin après 3 secondes
          const redirectTimer = setTimeout(() => {
            navigate(`/admin-login/${token}`, { replace: true });
          }, 3000);

          return () => clearTimeout(redirectTimer);
        }
      }
    }
  }, [data, token, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Vérification du token d'accès...
          </h2>
          <p className="text-slate-300">
            Validation de votre autorisation d'accès
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.validateAdminToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <SecuritySafe size={48} color="#f87171" variant="Bold" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Erreur de connexion
            </h2>
            <p className="text-red-300 mb-6">
              Impossible de valider votre token d'accès. Veuillez contacter un
              administrateur.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { isValid, message, expiresAt } = data.validateAdminToken;

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6">
              <Clock size={48} color="#fb923c" variant="Bold" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Token invalide ou expiré
            </h2>
            <p className="text-orange-300 mb-2">{message}</p>
            <p className="text-slate-400 text-sm mb-6">
              Ce lien d'accès n'est plus valide. Veuillez générer un nouveau
              token d'accès.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <p className="text-slate-300 text-sm font-mono">
                npm run generate-admin-access
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Token valide - afficher le message de redirection
  const expirationDate = new Date(expiresAt).toLocaleString('fr-FR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-green-500/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 animate-pulse">
            <ShieldTick size={48} color="#4ade80" variant="Bold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Accès autorisé ✓
          </h2>
          <p className="text-green-300 mb-6">{message}</p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Expire le :</span>
              <span className="text-white font-semibold">{expirationDate}</span>
            </div>
            {countdown !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Temps restant :</span>
                <span className="text-green-400 font-semibold">
                  {Math.floor(countdown / 3600)}h {Math.floor((countdown % 3600) / 60)}m {countdown % 60}s
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300">Redirection vers la page de connexion...</p>
          </div>

          <p className="text-slate-500 text-sm">
            Vous serez redirigé automatiquement dans quelques secondes
          </p>
        </div>
      </div>
    </div>
  );
}
