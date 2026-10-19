import { createBrowserRouter } from 'react-router';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { AccountPage } from '@/features/auth/pages/AccountPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { FlightsPage } from '@/pages/FlightsPage/FlightsPage';
import { HomePage } from '@/pages/HomePage/HomePage';
import { HotelsPage } from '@/pages/HotelsPage/HotelsPage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';
import { PlannerPage } from '@/pages/PlannerPage/PlannerPage';
import { paths } from './paths';

export const router = createBrowserRouter([
  {
    path: paths.home,
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.flights, element: <FlightsPage /> },
      { path: paths.hotels, element: <HotelsPage /> },
      { path: paths.planner, element: <PlannerPage /> },
      { path: paths.login, element: <LoginPage /> },
      { path: paths.register, element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [{ path: paths.account, element: <AccountPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
