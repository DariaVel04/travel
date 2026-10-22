import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Outlet, useLocation } from 'react-router';

export function PageTransition() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
