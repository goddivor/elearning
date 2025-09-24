import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, Student, ChalkboardTeacher } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SpinLoader from '@/components/ui/SpinLoader';
import { cn } from '@/lib/utils';
import useTitle from '@/hooks/useTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';
import type { ApiError } from '@/types/auth';

const SignUp = () => {
  useTitle("Inscription");
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Empêcher le scroll bounce sur cette page
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, []);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'instructor',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    { value: 'student', label: 'Étudiant', icon: Student, description: 'Suivre des cours et apprendre' },
    { value: 'instructor', label: 'Instructeur', icon: ChalkboardTeacher, description: 'Créer et enseigner des cours' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
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
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // D'abord créer le compte
      const { AuthService } = await import('@/services/authService');
      await AuthService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      success('Inscription réussie', 'Votre compte a été créé avec succès!');
      navigate('/dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      showError('Erreur d\'inscription', apiError.message);
      
      // Afficher les erreurs de validation si présentes
      if (apiError.statusCode === 400) {
        if (apiError.message.includes('email')) {
          setErrors({ email: 'Cette adresse email est déjà utilisée' });
        } else {
          setErrors({ general: apiError.message });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              connectez-vous à votre compte existant
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
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                label="Prénom"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                error={errors.firstName}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
              
              <Input
                id="lastName"
                name="lastName"
                type="text"
                label="Nom"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lastName}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@email.com"
              error={errors.email}
              className="focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vous êtes :
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <role.icon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {role.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmer votre mot de passe"
                  error={errors.confirmPassword}
                  className="focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                politique de confidentialité
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms}</p>
          )}

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
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;