import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_TEST_NOTIFICATION } from '@/graphql/mutations/notification.mutations';
import { useToast } from '@/contexts/toast-context';
import { Bell, TestTube } from '@phosphor-icons/react';

const Settings = () => {
  const [sendingTest, setSendingTest] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const [sendTestNotification] = useMutation(SEND_TEST_NOTIFICATION);

  const handleTestNotification = async () => {
    setSendingTest(true);
    try {
      await sendTestNotification();
      showSuccess(
        'Notification envoyée !',
        'Vérifiez l\'icône de notification dans le header 🔔'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      showError('Erreur', 'Impossible d\'envoyer la notification');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos préférences et testez les fonctionnalités
          </p>
        </div>

        {/* Notification Test Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell size={24} className="text-blue-600" weight="bold" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Système de Notifications
              </h2>
              <p className="text-gray-600 mb-4">
                Testez le système de notifications en temps réel. Lorsque vous cliquez sur le
                bouton, une notification sera envoyée et apparaîtra instantanément dans le
                header avec un badge de compteur.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Comment ça marche :</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Cliquez sur le bouton "Envoyer une notification de test"</li>
                  <li>Un badge (1) apparaîtra sur l'icône 🔔 dans le header</li>
                  <li>Cliquez sur l'icône pour voir la notification</li>
                  <li>Les notifications arrivent en temps réel via WebSocket</li>
                </ul>
              </div>
              <button
                onClick={handleTestNotification}
                disabled={sendingTest}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <TestTube size={20} weight="bold" />
                {sendingTest ? 'Envoi en cours...' : 'Envoyer une notification de test'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎉 Fonctionnalités Notifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Notifications en temps réel (WebSocket)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Badge de compteur dynamique</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Dropdown interactif avec liste</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Marquer comme lu / supprimer</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Notification de bienvenue auto</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Notifications desktop (si autorisé)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
