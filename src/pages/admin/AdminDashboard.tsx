import { useAdminAccessGuard } from '@/hooks/useAdminAccessGuard';
import { SecuritySafe, People, Teacher, Clock, TickCircle } from 'iconsax-react';

export default function AdminDashboard() {
  // Protection de la route avec vérification continue du token
  const { isAdmin, adminAccessToken } = useAdminAccessGuard();

  const tokenExpiresAt = localStorage.getItem('admin_token_expires_at');
  const expirationDate = tokenExpiresAt
    ? new Date(tokenExpiresAt).toLocaleString('fr-FR')
    : '';

  if (!isAdmin || !adminAccessToken) {
    return null; // La redirection est gérée par le hook
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <SecuritySafe size={32} color="#60a5fa" variant="Bold" />
            </div>
            <h1 className="text-4xl font-bold text-white">Dashboard Admin</h1>
          </div>
          <p className="text-slate-400">
            Gestion et administration de la plateforme
          </p>
        </div>

        {/* Token Status */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TickCircle size={24} color="#4ade80" variant="Bold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Session admin active
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Token d'accès :</span>
                  <span className="text-green-400 font-mono ml-2">
                    {adminAccessToken.substring(0, 16)}...
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Expire le :</span>
                  <span className="text-white font-semibold ml-2">
                    {expirationDate}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                🔒 Votre session est vérifiée automatiquement toutes les 30
                secondes
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">Utilisateurs</h3>
              <People size={24} color="#60a5fa" variant="Bold" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">--</p>
            <p className="text-sm text-slate-400">Statistique à venir</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">Candidatures</h3>
              <Teacher size={24} color="#c084fc" variant="Bold" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">--</p>
            <p className="text-sm text-slate-400">
              À approuver (fonctionnalité à venir)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">Sessions actives</h3>
              <Clock size={24} color="#4ade80" variant="Bold" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">1</p>
            <p className="text-sm text-slate-400">Votre session</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Bienvenue dans l'administration
          </h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Ce dashboard administrateur est protégé par un système de tokens
              d'accès temporaires sécurisés.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white mb-3">
                📋 Prochaines fonctionnalités
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>
                    Gestion des candidatures instructeurs (approuver/rejeter)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500">○</span>
                  <span>Gestion des utilisateurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500">○</span>
                  <span>Statistiques de la plateforme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500">○</span>
                  <span>Gestion des cours et contenus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500">○</span>
                  <span>Configuration de la plateforme</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Info :</strong> Votre session est automatiquement
                surveillée. Si votre token d'accès expire, vous serez
                déconnecté automatiquement pour des raisons de sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
