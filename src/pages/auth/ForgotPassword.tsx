import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, EnvelopeSimple, CheckCircle } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SpinLoader from '@/components/ui/SpinLoader';
import { cn } from '@/lib/utils';
import useTitle from '@/hooks/useTitle';

const ForgotPassword = () => {
  useTitle("Mot de passe oublié");

  // Empêcher le scroll bounce sur cette page
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, []);
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('L\'adresse e-mail est requise');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('L\'adresse e-mail n\'est pas valide');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement API call for password reset
      // console.log('Forgot password for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      // TODO: Implement resend email API call
      // console.log('Resending email to:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Resend email error:', error);
      setError('Impossible de renvoyer l\'e-mail. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              E-mail envoyé !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nous avons envoyé un lien de réinitialisation à
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <EnvelopeSimple className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Vérifiez votre boîte de réception
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  Cliquez sur le lien dans l'e-mail pour réinitialiser votre mot de passe. 
                  Si vous ne voyez pas l'e-mail, vérifiez votre dossier de spam.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className={cn(
                "w-full py-3 px-4 border border-blue-300 rounded-md shadow-sm bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading && <SpinLoader />}
              {loading ? 'Renvoi en cours...' : 'Renvoyer l\'e-mail'}
            </Button>

            <Link
              to="/signin"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/signin"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Link>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez votre adresse e-mail et nous vous enverrons un lien pour 
            réinitialiser votre mot de passe.
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="votre@email.com"
              error={error}
              className="focus:ring-blue-500 focus:border-blue-500"
            />

            <div>
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                  "flex items-center justify-center gap-2"
                )}
              >
                {loading && <SpinLoader />}
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;