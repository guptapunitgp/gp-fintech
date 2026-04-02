import { useState } from 'react';
import { isFirebaseConfigured, signInWithGooglePopup } from '../../lib/firebase';

function getFriendlyGoogleError(error) {
  const code = error?.code || '';

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was closed before completion.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google popup. Allow popups and try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network issue while contacting Google. Please try again.';
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'Another Google sign-in is already in progress.';
  }

  return error?.message || 'Unable to continue with Google.';
}

function GoogleAuthButton({
  label = 'Continue with Google',
  onCredential,
  disabled = false,
}) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithGooglePopup();
      const idToken = await result.user.getIdToken();
      await onCredential(idToken);
    } catch (authError) {
      setError(getFriendlyGoogleError(authError));
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
        Add Firebase web config values in `client/.env` to enable Google authentication.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          <span className="bg-white px-3 dark:bg-slate-950">{label}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="btn-secondary w-full gap-3"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm">
          G
        </span>
        {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
      </button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Secure sign-in powered by Firebase Authentication.
      </p>

      {error && <p className="text-center text-sm text-rose-500">{error}</p>}
    </div>
  );
}

export default GoogleAuthButton;
