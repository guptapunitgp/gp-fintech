import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuthStore } from '../store/useAuthStore';

const initialValues = {
  email: '',
  password: '',
};

function LoginPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const login = useAuthStore((state) => state.login);
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const globalError = useAuthStore((state) => state.error);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    if (!values.password.trim()) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      return error;
    }
  };

  const handleGoogleLogin = async (idToken) => {
    try {
      await googleAuth({ idToken });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      return error;
    }
  };

  return (
    <AuthLayout
      title="Sign in to your dashboard"
      subtitle="Access your secure finance workspace and continue where you left off."
      aside={
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-slate-800/70 dark:bg-slate-950/50">
          <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
            Admin accounts can create, edit, and delete transactions. Viewer accounts
            get the same analytics experience in a read-only mode.
          </p>
        </div>
      }
    >
      <AuthForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Sign in"
        globalError={globalError}
        extraContent={
          <GoogleAuthButton
            label="Or sign in with"
            onCredential={handleGoogleLogin}
            disabled={isSubmitting}
          />
        }
        footer={
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-300">
              Create one
            </Link>
          </p>
        }
      />
    </AuthLayout>
  );
}

export default LoginPage;
