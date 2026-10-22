import { ScrollRestoration } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
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
            <PageTransition />
          </main>
          <Footer />
          <ScrollRestoration />
        </div>
      </TripProvider>
    </AuthProvider>
  );
}
