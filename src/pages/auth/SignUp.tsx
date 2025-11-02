import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { EnvelopeSimple, FacebookLogo, ArrowRight, CheckCircle, GoogleLogo } from '@phosphor-icons/react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { SEND_REGISTER_OTP, VERIFY_REGISTER_OTP, GOOGLE_LOGIN, FACEBOOK_LOGIN } from '@/graphql/mutations/auth.mutations';
import { useToast } from '@/contexts/toast-context';


type Step = 'email' | 'otp';

const SignUp = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [sendRegisterOtp, { loading: sendingOtp }] = useMutation(SEND_REGISTER_OTP);
  const [verifyRegisterOtp, { loading: verifying }] = useMutation(VERIFY_REGISTER_OTP);
  const [googleLogin, { loading: googleLoading }] = useMutation(GOOGLE_LOGIN);
  const [facebookLogin, { loading: facebookLoading }] = useMutation(FACEBOOK_LOGIN);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Le nom complet est requis');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    if (!email.trim()) {
      setError('L\'email est requis');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('L\'email n\'est pas valide');
      return;
    }

    try {
      const { data } = await sendRegisterOtp({
        variables: {
          input: {
            email,
          }
        },
      });

      if (data?.sendRegisterOTP?.message) {
        showSuccess('Code envoyé', data.sendRegisterOTP.message);
        setStep('otp');
        setResendTimer(30);
      } else {
        setError('Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du code';
      setError(errorMessage);
      showError('Erreur', err instanceof Error ? err.message : 'Impossible d\'envoyer le code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Garder seulement le dernier caractère si plusieurs sont saisis
    const digit = value.slice(-1);

    if (!/^\d*$/.test(digit)) return; // Accepter seulement les chiffres

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Récupérer le texte collé
    const pastedText = e.clipboardData.getData('text');

    // Nettoyer la valeur collée (garder seulement les chiffres)
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 0) return;

    const newOtp = [...otp];

    // Remplir tous les inputs avec les chiffres du code
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }

    setOtp(newOtp);

    // Focus sur le dernier input rempli ou le dernier input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    setTimeout(() => {
      const targetInput = document.getElementById(`otp-${lastFilledIndex}`);
      targetInput?.focus();
    }, 0);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }

    try {
      const { data } = await verifyRegisterOtp({
        variables: {
          input: {
            email,
            code: otpCode,
            fullName,
          }
        },
      });

      if (data?.verifyRegisterOTP?.access_token) {
        // Store token
        localStorage.setItem('access_token', data.verifyRegisterOTP.access_token);

        showSuccess('Compte créé !', 'Bienvenue sur Elearning 3D+');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const errorMessage = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(errorMessage);
      showError('Erreur', errorMessage);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    try {
      // Récupérer les informations du profil Google
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      const userInfo = await response.json();

      // Appeler la mutation GraphQL
      const { data } = await googleLogin({
        variables: {
          input: {
            googleId: userInfo.sub,
            email: userInfo.email,
            fullName: userInfo.name,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            avatar: userInfo.picture,
          },
        },
      });

      if (data?.googleLogin?.access_token) {
        localStorage.setItem('access_token', data.googleLogin.access_token);
        const message = data.googleLogin.isNewUser ? 'Compte créé !' : 'Connexion réussie !';
        showSuccess(message, 'Bienvenue sur Elearning 3D+');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      showError('Erreur', 'Impossible de se connecter avec Google');
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => showError('Erreur', 'Échec de la connexion Google'),
  });

  const handleFacebookSuccess = async (response: { accessToken: string; userID: string; name?: string; email?: string; picture?: { data?: { url?: string } } }) => {
    try {
      // Appeler la mutation GraphQL avec les données Facebook
      const { data } = await facebookLogin({
        variables: {
          input: {
            facebookId: response.userID,
            email: response.email || '',
            fullName: response.name || '',
            firstName: response.name?.split(' ')[0] || '',
            lastName: response.name?.split(' ').slice(1).join(' ') || '',
            avatar: response.picture?.data?.url,
          },
        },
      });

      if (data?.facebookLogin?.access_token) {
        localStorage.setItem('access_token', data.facebookLogin.access_token);
        const message = data.facebookLogin.isNewUser ? 'Compte créé !' : 'Connexion réussie !';
        showSuccess(message, 'Bienvenue sur Elearning 3D+');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      showError('Erreur', 'Impossible de se connecter avec Facebook');
    }
  };

  const handleFacebookError = (error: unknown) => {
    console.error('Facebook login error:', error);
    showError('Erreur', 'Échec de la connexion Facebook');
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError('');
    try {
      const { data } = await sendRegisterOtp({
        variables: {
          input: {
            email,
          }
        },
      });

      if (data?.sendRegisterOTP?.message) {
        showSuccess('Code renvoyé', data.sendRegisterOTP.message);
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      showError('Erreur', 'Impossible de renvoyer le code');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-32 min-h-[calc(100vh-400px)]">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {step === 'email'
                ? 'Créer votre compte gratuitement'
                : 'Vérifiez votre email'
              }
            </h1>
            {step === 'otp' && (
              <p className="text-gray-600 text-lg">
                Nous avons envoyé un code à <span className="font-semibold">{email}</span>
              </p>
            )}
          </div>

          {/* Main Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    {/* Full Name Input */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="relative">
                        <EnvelopeSimple
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        />
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span>{sendingOtp ? 'Envoi en cours...' : 'Continuer'}</span>
                      {!sendingOtp && (
                        <ArrowRight
                          size={20}
                          weight="bold"
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
                      </div>
                    </div>

                    {/* Social Signup Buttons - Circular */}
                    <div className="flex items-center justify-center space-x-6">
                      <button
                        type="button"
                        onClick={() => handleGoogleSignup()}
                        disabled={googleLoading}
                        className="w-16 h-16 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-red-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <GoogleLogo size={28} weight="bold" className="text-red-500 group-hover:scale-110 transition-transform" />
                      </button>

                      <FacebookLogin
                        appId={import.meta.env.VITE_FACEBOOK_APP_ID || ''}
                        onSuccess={handleFacebookSuccess}
                        onFail={handleFacebookError}
                        render={({ onClick }) => (
                          <button
                            type="button"
                            onClick={onClick}
                            disabled={facebookLoading}
                            className="w-16 h-16 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-blue-600 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FacebookLogo size={28} weight="fill" className="text-blue-600 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      />
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                        Entrez le code à 6 chiffres
                      </label>
                      <div className="flex justify-center space-x-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                          />
                        ))}
                      </div>
                      {error && (
                        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
                      )}
                    </div>

                    {/* Resend Code with Timer */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Vous n'avez pas reçu le code ?
                      </p>
                      {resendTimer > 0 ? (
                        <p className="text-sm font-semibold text-gray-500">
                          Renvoyer dans {resendTimer}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={sendingOtp}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                        >
                          {sendingOtp ? 'Envoi...' : 'Renvoyer le code'}
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={verifying}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {verifying ? (
                        <span>Vérification...</span>
                      ) : (
                        <>
                          <CheckCircle size={20} weight="bold" />
                          <span>Créer mon compte</span>
                        </>
                      )}
                    </button>

                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp(['', '', '', '', '', '']);
                        setError('');
                        setResendTimer(0);
                      }}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Modifier l'adresse email
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/signin" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
