import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router';
import { paths } from '@/app/paths';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import card from '@/components/ui/Card.module.css';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cx } from '@/utils/classNames';
import { useAuth } from '../hooks/useAuth';
import { authErrorKey } from '../services/authErrors';
import {
  MIN_PASSWORD_LENGTH,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from '../validation';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle(t('auth.register.title'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={paths.account} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
    setFieldErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate(paths.account, { replace: true });
    } catch (error) {
      setFormError(t(authErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cx('container', styles.page)}>
      <PageHeader title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} />
      <form className={cx(card.card, styles.form)} onSubmit={handleSubmit} noValidate>
        <Field label={t('auth.fields.name')} htmlFor="register-name">
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.name && <p className={styles.fieldError}>{t(fieldErrors.name)}</p>}
        </Field>
        <Field label={t('auth.fields.email')} htmlFor="register-email">
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.email && <p className={styles.fieldError}>{t(fieldErrors.email)}</p>}
        </Field>
        <Field
          label={t('auth.fields.password')}
          htmlFor="register-password"
          hint={t('auth.fields.passwordHint', { min: MIN_PASSWORD_LENGTH })}
        >
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password && <p className={styles.fieldError}>{t(fieldErrors.password)}</p>}
        </Field>
        <Field label={t('auth.fields.confirmPassword')} htmlFor="register-confirm">
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.confirmPassword && (
            <p className={styles.fieldError}>{t(fieldErrors.confirmPassword)}</p>
          )}
        </Field>
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>
      <p className={styles.switch}>
        {t('auth.register.hasAccount')}{' '}
        <Link to={paths.login}>{t('auth.register.loginLink')}</Link>
      </p>
    </div>
  );
}
