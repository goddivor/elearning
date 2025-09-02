import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SpinLoader from '@/components/ui/SpinLoader';
import { cn } from '@/lib/utils';
import useTitle from '@/hooks/useTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/context/toast-context';
import type { ApiError } from '@/types/auth';

const SignIn = () => {
  useTitle("Connexion");
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await login(formData.email, formData.password);
      success('Connexion réussie', 'Vous êtes maintenant connecté!');
      navigate('/dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      showError('Erreur de connexion', apiError.message);
      
      // Afficher les erreurs de validation si présentes
      if (apiError.statusCode === 400) {
        setErrors({ general: apiError.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Adresse e-mail"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                error={errors.email}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    error={errors.password}
                    className="focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

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
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;