import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumeGoogleRedirectResult } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';

const googleAuthPendingKey = 'gp-fintech-google-auth-pending';
const googleAuthConsumedKey = 'gp-fintech-google-auth-consumed';
const googleAuthModeKey = 'gp-fintech-google-auth-mode';
const googleAuthRoleKey = 'gp-fintech-google-auth-role';
const googleAuthTargetKey = 'gp-fintech-google-auth-target';

function clearGoogleRedirectState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(googleAuthPendingKey);
  window.sessionStorage.removeItem(googleAuthConsumedKey);
  window.sessionStorage.removeItem(googleAuthModeKey);
  window.sessionStorage.removeItem(googleAuthRoleKey);
  window.sessionStorage.removeItem(googleAuthTargetKey);
}

function AuthRedirectHandler() {
  const navigate = useNavigate();
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const setIsProcessingRedirect = useAuthStore((state) => state.setIsProcessingRedirect);

  useEffect(() => {
    let isMounted = true;

    async function processRedirect() {
      if (typeof window === 'undefined') {
        return;
      }

      const isPending = window.sessionStorage.getItem(googleAuthPendingKey) === '1';
      const isConsumed = window.sessionStorage.getItem(googleAuthConsumedKey) === '1';

      if (!isPending || isConsumed) {
        setIsProcessingRedirect(false);
        return;
      }

      const mode = window.sessionStorage.getItem(googleAuthModeKey) || 'login';
      const role = window.sessionStorage.getItem(googleAuthRoleKey) || 'viewer';
      const target = window.sessionStorage.getItem(googleAuthTargetKey) || '/';

      try {
        setIsProcessingRedirect(true);
        window.sessionStorage.setItem(googleAuthConsumedKey, '1');
        const result = await consumeGoogleRedirectResult();

        if (!result?.user || !isMounted) {
          clearGoogleRedirectState();
          setIsProcessingRedirect(false);
          return;
        }

        const idToken = await result.user.getIdToken();
        await googleAuth({
          idToken,
          role: mode === 'register' ? role : undefined,
        });

        clearGoogleRedirectState();
        setIsProcessingRedirect(false);
        navigate(target, { replace: true });
      } catch (_error) {
        clearGoogleRedirectState();
        setIsProcessingRedirect(false);
      }
    }

    processRedirect();

    return () => {
      isMounted = false;
    };
  }, [googleAuth, navigate, setIsProcessingRedirect]);

  return null;
}

export default AuthRedirectHandler;
