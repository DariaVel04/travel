import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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

export function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, changePassword } = useAuth();
  useDocumentTitle(t('auth.account.title'));

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString(i18n.language, {
    dateStyle: 'long',
  });

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    setProfileErrors(nextErrors);
    setProfileError(null);
    setProfileSaved(false);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileSaved(true);
    } catch (error) {
      setProfileError(t(authErrorKey(error)));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!currentPassword) nextErrors.currentPassword = 'auth.validation.currentPasswordRequired';
    const newPasswordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (newPasswordError) nextErrors.newPassword = newPasswordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
    setPasswordErrors(nextErrors);
    setPasswordError(null);
    setPasswordSaved(false);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    } catch (error) {
      setPasswordError(t(authErrorKey(error)));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className={cx('container', styles.page, styles.wide)}>
      <PageHeader title={t('auth.account.title')} subtitle={t('auth.account.subtitle')} />

      <section className={cx(card.card, styles.section)}>
        <h2 className={styles.sectionTitle}>{t('auth.account.overview')}</h2>
        <dl className={styles.details}>
          <div>
            <dt>{t('auth.fields.name')}</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>{t('auth.fields.email')}</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>{t('auth.account.status')}</dt>
            <dd>
              {user.status === 'ACTIVE'
                ? t('auth.status.ACTIVE')
                : user.status === 'SUSPENDED'
                  ? t('auth.status.SUSPENDED')
                  : t('auth.status.DELETED')}
            </dd>
          </div>
          <div>
            <dt>{t('auth.account.plan')}</dt>
            <dd>
              {user.subscriptionPlan === 'PREMIUM' ? t('auth.plan.PREMIUM') : t('auth.plan.FREE')}
            </dd>
          </div>
          <div>
            <dt>{t('auth.account.memberSince')}</dt>
            <dd>{memberSince}</dd>
          </div>
        </dl>
      </section>

      <form className={cx(card.card, styles.form)} onSubmit={handleProfileSubmit} noValidate>
        <h2 className={styles.sectionTitle}>{t('auth.account.editProfile')}</h2>
        <Field label={t('auth.fields.name')} htmlFor="account-name">
          <input
            id="account-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={savingProfile}
          />
          {profileErrors.name && <p className={styles.fieldError}>{t(profileErrors.name)}</p>}
        </Field>
        <Field label={t('auth.fields.email')} htmlFor="account-email">
          <input
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={savingProfile}
          />
          {profileErrors.email && <p className={styles.fieldError}>{t(profileErrors.email)}</p>}
        </Field>
        {profileError && (
          <p className={styles.formError} role="alert">
            {profileError}
          </p>
        )}
        {profileSaved && <p className={styles.success}>{t('auth.account.profileSaved')}</p>}
        <div className={styles.actions}>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? t('auth.account.saving') : t('auth.account.saveProfile')}
          </Button>
        </div>
      </form>

      <form className={cx(card.card, styles.form)} onSubmit={handlePasswordSubmit} noValidate>
        <h2 className={styles.sectionTitle}>{t('auth.account.changePassword')}</h2>
        <Field label={t('auth.fields.currentPassword')} htmlFor="account-current-password">
          <input
            id="account-current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={savingPassword}
          />
          {passwordErrors.currentPassword && (
            <p className={styles.fieldError}>{t(passwordErrors.currentPassword)}</p>
          )}
        </Field>
        <Field
          label={t('auth.fields.newPassword')}
          htmlFor="account-new-password"
          hint={t('auth.fields.passwordHint', { min: MIN_PASSWORD_LENGTH })}
        >
          <input
            id="account-new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={savingPassword}
          />
          {passwordErrors.newPassword && (
            <p className={styles.fieldError}>{t(passwordErrors.newPassword)}</p>
          )}
        </Field>
        <Field label={t('auth.fields.confirmPassword')} htmlFor="account-confirm-password">
          <input
            id="account-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={savingPassword}
          />
          {passwordErrors.confirmPassword && (
            <p className={styles.fieldError}>{t(passwordErrors.confirmPassword)}</p>
          )}
        </Field>
        {passwordError && (
          <p className={styles.formError} role="alert">
            {passwordError}
          </p>
        )}
        {passwordSaved && <p className={styles.success}>{t('auth.account.passwordSaved')}</p>}
        <div className={styles.actions}>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? t('auth.account.saving') : t('auth.account.savePassword')}
          </Button>
        </div>
      </form>
    </div>
  );
}
