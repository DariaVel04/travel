import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { paths } from '@/app/paths';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { Logo } from '@/components/Logo/Logo';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { TripSummary } from '@/features/trips/components/TripSummary';
import { cx } from '@/utils/classNames';
import styles from './Header.module.css';

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: paths.home, label: t('nav.home'), end: true },
    { to: paths.flights, label: t('nav.flights') },
    { to: paths.hotels, label: t('nav.hotels') },
    { to: paths.planner, label: t('nav.planner') },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={cx('container', styles.inner)}>
        <Logo />

        <div id="main-menu" className={cx(styles.menu, isMenuOpen && styles.menuOpen)}>
          <nav aria-label={t('nav.mainNavigation')}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={closeMenu}
                    className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <LanguageSwitcher />
            {!isLoading &&
              (isAuthenticated ? (
                <>
                  <ButtonLink to={paths.account} variant="secondary" onClick={closeMenu}>
                    {t('nav.account')}
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      closeMenu();
                      void logout();
                    }}
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <ButtonLink to={paths.login} variant="secondary" onClick={closeMenu}>
                  {t('nav.login')}
                </ButtonLink>
              ))}
          </div>
        </div>

        <div className={styles.tools}>
          <TripSummary />
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className={cx(styles.burger, isMenuOpen && styles.burgerOpen)} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
