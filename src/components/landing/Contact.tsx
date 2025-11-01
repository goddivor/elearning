import { EnvelopeSimple, MapPin, Phone, PaperPlaneTilt } from '@phosphor-icons/react';
import { FadeIn, SlideInLeft, SlideInRight } from './AnimatedSection';
import { useState } from 'react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <EnvelopeSimple size={16} weight="fill" />
            <span>Contactez-nous</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Une question ? Parlons-en !
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. Remplissez le formulaire ou contactez-nous directement.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <SlideInLeft>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h3>
                <p className="text-gray-600 mb-8">
                  Vous avez une question sur nos cours, nos tarifs ou nos fonctionnalités ?
                  N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EnvelopeSimple size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">contact@elearning3d.com</p>
                    <p className="text-sm text-gray-500">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Téléphone</h4>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                    <p className="text-sm text-gray-500">Lun-Ven, 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adresse</h4>
                    <p className="text-gray-600">123 Avenue de l'Innovation</p>
                    <p className="text-sm text-gray-500">75001 Paris, France</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">Horaires d'ouverture</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lundi - Vendredi</span>
                    <span className="font-semibold text-gray-900">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samedi</span>
                    <span className="font-semibold text-gray-900">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimanche</span>
                    <span className="font-semibold text-gray-900">Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </SlideInLeft>

          {/* Contact Form */}
          <SlideInRight>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="support">Support technique</option>
                    <option value="sales">Ventes & tarification</option>
                    <option value="organization">Solution Organisation</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold group"
                >
                  <span>Envoyer le message</span>
                  <PaperPlaneTilt
                    size={20}
                    weight="fill"
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </button>

                <p className="text-sm text-gray-600 text-center">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <a href="/privacy" className="text-purple-600 hover:underline">
                    politique de confidentialité
                  </a>
                </p>
              </form>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
};
