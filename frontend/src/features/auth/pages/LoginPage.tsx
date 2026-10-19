import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { paths } from '@/app/paths';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import card from '@/components/ui/Card.module.css';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cx } from '@/utils/classNames';
import { useAuth } from '../hooks/useAuth';
import { authErrorKey } from '../services/authErrors';
import { validateEmail, validatePassword, type FieldErrors } from '../validation';
import styles from './AuthPages.module.css';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle(t('auth.login.title'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={paths.account} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setFieldErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== paths.login && from !== paths.register ? from : paths.account, {
        replace: true,
      });
    } catch (error) {
      setFormError(t(authErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cx('container', styles.page)}>
      <PageHeader title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />
      <form className={cx(card.card, styles.form)} onSubmit={handleSubmit} noValidate>
        <Field label={t('auth.fields.email')} htmlFor="login-email">
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.email && <p className={styles.fieldError}>{t(fieldErrors.email)}</p>}
        </Field>
        <Field label={t('auth.fields.password')} htmlFor="login-password">
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password && <p className={styles.fieldError}>{t(fieldErrors.password)}</p>}
        </Field>
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>
      <p className={styles.switch}>
        {t('auth.login.noAccount')}{' '}
        <Link to={paths.register}>{t('auth.login.registerLink')}</Link>
      </p>
    </div>
  );
}
