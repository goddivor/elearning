import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, Building } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SpinLoader from '@/components/ui/SpinLoader';
import { cn } from '@/lib/utils';
import useTitle from '@/hooks/useTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';
import type { ApiError } from '@/types/auth';

const OrganizationSignUp = () => {
  useTitle("Inscription Organisation");
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    // Données organisation
    organizationName: '',
    organizationDescription: '',
    organizationType: 'school' as 'school' | 'university' | 'training-center' | 'corporate',
    organizationAddress: '',
    organizationContactEmail: '',
    organizationContactPhone: '',
    organizationWebsite: '',
    // Données utilisateur
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const organizationTypes = [
    { value: 'school', label: 'École' },
    { value: 'university', label: 'Université' },
    { value: 'training-center', label: 'Centre de Formation' },
    { value: 'corporate', label: 'Institut privé' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validation organisation
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Le nom de l\'organisation est requis';
    }

    if (!formData.organizationDescription.trim()) {
      newErrors.organizationDescription = 'La description est requise';
    }

    if (!formData.organizationAddress.trim()) {
      newErrors.organizationAddress = 'L\'adresse est requise';
    }

    if (!formData.organizationContactEmail.trim()) {
      newErrors.organizationContactEmail = 'L\'email de contact est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.organizationContactEmail)) {
      newErrors.organizationContactEmail = 'L\'email de contact n\'est pas valide';
    }

    if (!formData.organizationContactPhone.trim()) {
      newErrors.organizationContactPhone = 'Le téléphone de contact est requis';
    }

    // Validation utilisateur
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
      // Appeler l'API register-organization
      const { AuthService } = await import('@/services/authService');
      await AuthService.registerOrganization({
        // Données utilisateur
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Données organisation
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
        organizationType: formData.organizationType,
        organizationAddress: formData.organizationAddress,
        organizationContactEmail: formData.organizationContactEmail,
        organizationContactPhone: formData.organizationContactPhone,
        organizationWebsite: formData.organizationWebsite
      });

      success('Inscription réussie', 'Votre organisation et votre compte ont été créés avec succès!');
      navigate('/dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      showError('Erreur d\'inscription', apiError.message);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer une organisation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enregistrez votre organisation et créez votre compte gestionnaire
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </Link>
            {' ou '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              inscription individuelle
            </Link>
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Section Organisation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations de l'organisation
              </h3>
              <div className="space-y-4">
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  label="Nom de l'organisation"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="École Primaire Les Roses"
                  error={errors.organizationName}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />

                <div>
                  <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="organizationDescription"
                    name="organizationDescription"
                    rows={3}
                    value={formData.organizationDescription}
                    onChange={handleChange}
                    placeholder="Décrivez votre organisation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.organizationDescription && (
                    <p className="text-sm text-red-600 mt-1">{errors.organizationDescription}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'organisation
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {organizationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  id="organizationAddress"
                  name="organizationAddress"
                  type="text"
                  label="Adresse"
                  required
                  value={formData.organizationAddress}
                  onChange={handleChange}
                  placeholder="123 Rue de l'Éducation, 75001 Paris"
                  error={errors.organizationAddress}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="organizationContactEmail"
                    name="organizationContactEmail"
                    type="email"
                    label="Email de contact"
                    required
                    value={formData.organizationContactEmail}
                    onChange={handleChange}
                    placeholder="contact@organisation.fr"
                    error={errors.organizationContactEmail}
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />

                  <Input
                    id="organizationContactPhone"
                    name="organizationContactPhone"
                    type="tel"
                    label="Téléphone"
                    required
                    value={formData.organizationContactPhone}
                    onChange={handleChange}
                    placeholder="+33 1 23 45 67 89"
                    error={errors.organizationContactPhone}
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <Input
                  id="organizationWebsite"
                  name="organizationWebsite"
                  type="url"
                  label="Site web (optionnel)"
                  value={formData.organizationWebsite}
                  onChange={handleChange}
                  placeholder="https://www.organisation.fr"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Section Utilisateur Gestionnaire */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Votre compte gestionnaire
              </h3>
              <div className="space-y-4">
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
                {loading ? 'Création en cours...' : 'Créer l\'organisation et mon compte'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignUp;