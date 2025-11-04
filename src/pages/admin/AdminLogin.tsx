import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADMIN_LOGIN,
  VALIDATE_ADMIN_TOKEN,
} from '@/graphql/mutations/admin-access.mutations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';
import {
  Lock,
  Sms,
  SecuritySafe,
  Eye,
  EyeSlash,
  InfoCircle,
} from 'iconsax-react';

export default function AdminLogin() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Valider le token avant d'afficher le formulaire
  const { data: tokenData, loading: tokenLoading } = useQuery(
    VALIDATE_ADMIN_TOKEN,
    {
      variables: { token: token || '' },
      skip: !token,
    },
  );

  const [adminLogin, { loading: loginLoading }] = useMutation(ADMIN_LOGIN, {
    onCompleted: (data) => {
      const { accessToken, user, tokenExpiresAt, adminAccessToken } =
        data.adminLogin;

      // Stocker le token d'accès admin dans localStorage pour vérification continue
      localStorage.setItem('admin_access_token', adminAccessToken);
      localStorage.setItem('admin_token_expires_at', tokenExpiresAt);

      // Stocker le JWT token pour l'authentification
      localStorage.setItem('access_token', accessToken);

      // Utiliser loginWithOAuth pour mettre à jour le user dans le contexte
      loginWithOAuth(user);

      showSuccess(
        'Connexion réussie',
        `Bienvenue ${user.fullName || user.email} !`,
      );

      // Rediriger vers le dashboard admin
      navigate('/admin/dashboard', { replace: true });
    },
    onError: (error) => {
      console.error('Admin login error:', error);
      showError(
        'Erreur de connexion',
        error.message || 'Identifiants incorrects ou token invalide',
      );
    },
  });

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (tokenData && !tokenData.validateAdminToken?.isValid) {
      showError(
        'Token invalide',
        'Ce lien d\'accès n\'est plus valide. Veuillez générer un nouveau token.',
      );
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    }
  }, [tokenData, navigate, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showError('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }

    if (!token) {
      showError('Token manquant', 'Token d\'accès invalide');
      return;
    }

    await adminLogin({
      variables: {
        token,
        email,
        password,
      },
    });
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tokenData?.validateAdminToken?.isValid) {
    return null; // Redirection en cours
  }

  const expirationDate = tokenData.validateAdminToken.expiresAt
    ? new Date(tokenData.validateAdminToken.expiresAt).toLocaleString('fr-FR')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <SecuritySafe size={40} color="#60a5fa" variant="Bold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Administration
          </h1>
          <p className="text-slate-400">Connexion sécurisée au dashboard</p>
        </div>

        {/* Token Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <InfoCircle size={20} color="#60a5fa" variant="Bold" />
            <div className="text-sm">
              <p className="text-blue-300 font-semibold mb-1">
                Accès temporaire autorisé
              </p>
              <p className="text-blue-400/80">
                Ce lien expire le <strong>{expirationDate}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email administrateur
              </label>
              <div className="relative">
                <Sms size={20} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={20} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeSlash size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <SecuritySafe size={20} color="#ffffff" variant="Bold" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center">
              🔒 Connexion sécurisée avec token d'accès temporaire
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
