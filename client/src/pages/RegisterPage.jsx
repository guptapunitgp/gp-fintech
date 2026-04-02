import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuthStore } from '../store/useAuthStore';
 
const initialValues = {
  email: '',
  password: '',
  role: 'viewer',
};

function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({}); 
  const register = useAuthStore((state) => state.register);
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const globalError = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    if (values.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (error) {
      return error;
    }
  };

  const handleGoogleRegister = async (idToken) => {
    try {
      await googleAuth({
        idToken,
        role: values.role,
      });
      navigate('/', { replace: true });
    } catch (error) {
      return error;
    }
  };

  return (
    <AuthLayout
      title="Create your finance account"
      subtitle="Register as an admin or viewer and start tracking transactions immediately."
      aside={
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-slate-800/70 dark:bg-slate-950/50">
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
              Choose <span className="font-semibold text-slate-950 dark:text-white">admin</span>{' '}
              for write access or{' '}
              <span className="font-semibold text-slate-950 dark:text-white">viewer</span> for
              read-only analytics.
            </p>
          </div>
        </div>
      }
    >
      <AuthForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create account"
        includeRole
        globalError={globalError}
        extraContent={
          <GoogleAuthButton
            label="Or continue with"
            onCredential={handleGoogleRegister}
            disabled={isSubmitting}
          />
        }
        footer={
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-300">
              Sign in
            </Link>
          </p>
        }
      />
    </AuthLayout>
  );
}

export default RegisterPage;
