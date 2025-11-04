import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  GraduationCap,
  Lightbulb,
  Users,
  Sparkle,
  Heart
} from '@phosphor-icons/react';
import { APPLY_FOR_INSTRUCTOR } from '@/graphql/mutations/instructor.mutations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';

interface FormData {
  teachingExperience: string;
  teachingBackground: string;
  subjectsToTeach: string;
  communityBuildingIdeas: string;
  aiToolsUsage: string;
  motivation: string;
}

export default function InstructorApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    teachingExperience: '',
    teachingBackground: '',
    subjectsToTeach: '',
    communityBuildingIdeas: '',
    aiToolsUsage: '',
    motivation: ''
  });

  // Vérifier l'authentification et le statut instructeur
  useEffect(() => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec l'URL de retour
      navigate(`/signin?redirect=${encodeURIComponent(location.pathname)}`, {
        replace: true
      });
      return;
    }

    // Si l'utilisateur est déjà instructeur, le rediriger vers le dashboard
    const isInstructor = user?.roles?.includes('instructor') || user?.role === 'instructor';
    if (isInstructor) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const [applyForInstructor, { loading }] = useMutation(APPLY_FOR_INSTRUCTOR, {
    onCompleted: () => {
      // Redirection vers la page de confirmation
      navigate('/application-submitted', { replace: true });
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      showError(
        'Erreur lors de la soumission',
        error.message || 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  });

  const steps = [
    {
      id: 'experience',
      title: 'Votre expérience',
      icon: <GraduationCap className="w-6 h-6" />,
      fields: [
        {
          name: 'teachingExperience' as keyof FormData,
          label: 'Quel est votre niveau d\'expérience dans l\'enseignement ?',
          type: 'radio',
          options: [
            { value: 'beginner', label: 'Débutant - Je commence tout juste à enseigner' },
            { value: 'intermediate', label: 'Intermédiaire - J\'ai quelques années d\'expérience' },
            { value: 'advanced', label: 'Avancé - Je suis un enseignant expérimenté' },
            { value: 'expert', label: 'Expert - J\'enseigne depuis de nombreuses années' }
          ]
        },
        {
          name: 'teachingBackground' as keyof FormData,
          label: 'Parlez-nous de votre parcours d\'enseignement',
          type: 'textarea',
          placeholder: 'Avez-vous déjà enseigné en ligne ou en personne ? Quels types de formations avez-vous donnés ? Partagez votre expérience...',
          rows: 6
        }
      ]
    },
    {
      id: 'subjects',
      title: 'Vos sujets',
      icon: <Lightbulb className="w-6 h-6" />,
      fields: [
        {
          name: 'subjectsToTeach' as keyof FormData,
          label: 'Quels sujets souhaitez-vous enseigner ?',
          type: 'textarea',
          placeholder: 'Listez les domaines dans lesquels vous êtes expert et que vous aimeriez enseigner (ex: développement web, design, marketing, langues, etc.)',
          rows: 6
        }
      ]
    },
    {
      id: 'community',
      title: 'Votre communauté',
      icon: <Users className="w-6 h-6" />,
      fields: [
        {
          name: 'communityBuildingIdeas' as keyof FormData,
          label: 'Comment envisagez-vous de développer votre communauté d\'étudiants ?',
          type: 'textarea',
          placeholder: 'Avez-vous des idées pour engager vos étudiants ? (réseaux sociaux, forums, sessions live, projets collaboratifs, etc.)',
          rows: 6
        }
      ]
    },
    {
      id: 'ai-tools',
      title: 'Outils & IA',
      icon: <Sparkle className="w-6 h-6" />,
      fields: [
        {
          name: 'aiToolsUsage' as keyof FormData,
          label: 'Utilisez-vous des outils d\'intelligence artificielle pour créer ou planifier vos cours ?',
          type: 'textarea',
          placeholder: 'Partagez votre expérience avec les outils d\'IA (ChatGPT, MidJourney, etc.) pour la création de contenu éducatif, la planification de cours, ou l\'assistance pédagogique...',
          rows: 6
        }
      ]
    },
    {
      id: 'motivation',
      title: 'Votre motivation',
      icon: <Heart className="w-6 h-6" />,
      fields: [
        {
          name: 'motivation' as keyof FormData,
          label: 'Pourquoi voulez-vous devenir instructeur sur Elearning 3D+ ?',
          type: 'textarea',
          placeholder: 'Qu\'est-ce qui vous motive à partager vos connaissances ? Quel impact souhaitez-vous avoir sur vos étudiants ?',
          rows: 6
        }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStepValid = () => {
    return currentStepData.fields.every(field => {
      const value = formData[field.name];
      return value && value.trim().length > 0;
    });
  };

  const handleNext = () => {
    if (isStepValid()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler votre candidature ?')) {
      navigate('/become-instructor');
    }
  };

  const handleSubmit = async () => {
    try {
      await applyForInstructor({
        variables: {
          input: {
            answers: {
              ...formData
            }
          }
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Candidature Instructeur
          </h1>
          <p className="text-lg text-slate-600">
            Partagez-nous vos expériences et votre vision de l'enseignement
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        index < currentStep ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 text-sm text-slate-600">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  index === currentStep ? 'font-semibold text-blue-600' : ''
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200">
          {/* Step Icon & Title */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600">
              {currentStepData.icon}
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">
                Étape {currentStep + 1} sur {steps.length}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentStepData.title}
              </h2>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-8">
            {currentStepData.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-lg font-semibold text-slate-900 mb-4">
                  {field.label}
                </label>

                {field.type === 'radio' && field.options ? (
                  <div className="space-y-3">
                    {field.options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData[field.name] === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={option.value}
                          checked={formData[field.name] === option.value}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="flex-1 text-slate-700 font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors resize-none text-slate-700"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Annuler</span>
            </button>

            <div className="flex items-center gap-4">
              {!isFirstStep && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 font-semibold transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Précédent</span>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                  isStepValid() && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{isLastStep ? (loading ? 'Envoi...' : 'Soumettre') : 'Suivant'}</span>
                {!isLastStep && <ArrowRight className="w-5 h-5" />}
                {isLastStep && !loading && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Vos réponses nous aideront à mieux comprendre votre profil.<br />
            Le processus de validation prend généralement 24-48 heures.
          </p>
        </div>
      </div>
    </div>
  );
}
