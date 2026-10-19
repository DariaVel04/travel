import { Outlet, ScrollRestoration } from 'react-router';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { TripProvider } from '@/features/trips/TripProvider';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <AuthProvider>
      <TripProvider>
        <div className={styles.layout}>
          <Header />
          <main className={styles.main}>
            <Outlet />
          </main>
          <Footer />
          <ScrollRestoration />
        </div>
      </TripProvider>
    </AuthProvider>
  );
}
