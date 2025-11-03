import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

const GOOGLE_ONE_TAP_MUTATION = gql`
  mutation GoogleOneTap($input: GoogleOneTapInput!) {
    googleOneTap(input: $input) {
      message
      access_token
      isNewUser
      user {
        id
        email
        fullName
        role
        roles
        avatar
      }
    }
  }
`;

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
}

interface UseGoogleOneTapOptions {
  clientId: string;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGoogleOneTap = ({
  clientId,
  autoSelect = true,
  cancelOnTapOutside = false,
  onSuccess,
  onError,
}: UseGoogleOneTapOptions) => {
  const { loginWithOAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Don't load Google One Tap if user is already authenticated
    if (isAuthenticated) return;

    // Only initialize once
    if (isInitialized.current) return;
    if (!clientId) {
      console.warn('Google Client ID is not provided');
      return;
    }

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (document.getElementById('google-one-tap-script')) return;

      const script = document.createElement('script');
      script.id = 'google-one-tap-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initializeGoogleOneTap();
      };

      document.body.appendChild(script);
    };

    const initializeGoogleOneTap = () => {
      if (!window.google) {
        console.error('Google Identity Services not loaded');
        return;
      }

      isInitialized.current = true;

      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: autoSelect,
        cancel_on_tap_outside: cancelOnTapOutside,
      });

      // Display the One Tap prompt
      window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap prompt not displayed:', notification.getNotDisplayedReason());
        }
      });
    };

    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
      try {
        const { credential } = response;

        // Call GraphQL mutation
        const { data } = await apolloClient.mutate({
          mutation: GOOGLE_ONE_TAP_MUTATION,
          variables: {
            input: { credential },
          },
        });

        if (data?.googleOneTap) {
          const { access_token, user } = data.googleOneTap;

          // Save token and update auth context
          localStorage.setItem('access_token', access_token);
          loginWithOAuth(user);

          // Navigate to dashboard
          navigate('/dashboard');

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        console.error('Google One Tap authentication failed:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [clientId, autoSelect, cancelOnTapOutside, loginWithOAuth, navigate, onSuccess, onError, isAuthenticated]);
};

// Type definitions for Google Identity Services
interface GoogleConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleConfig) => void;
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}
