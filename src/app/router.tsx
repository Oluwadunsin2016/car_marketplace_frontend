import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/app/layouts/AppLayout';
import ProtectedRoute from '@/app/routes/ProtectedRoute';
import AuthLayout from '@/features/auth/AuthLayout';
import AuthCallbackPage from '@/features/auth/pages/AuthCallbackPage';
import OnboardingPage from '@/features/auth/pages/OnboardingPage';
import SignInPage from '@/features/auth/pages/SignInPage';
import SignUpPage from '@/features/auth/pages/SignUpPage';
import Home from '@/features/home/HomePage';
import Profile from '@/features/profile/pages';
import PublicProfile from '@/features/profile/pages/PublicProfile';
import AddListing from '@/features/listings/add-listing';
import SearchByOptions from '@/features/search/pages';
import SearchByCategory from '@/features/search/pages/[category]';
import ListingDetails from '@/features/listings/listing-details/[id]';
import Chats from '@/features/chat/components/Chats';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/sign-in/*',
        element: <SignInPage />,
      },
      {
        path: '/sign-up/*',
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: '/sso-callback',
    element: <AuthenticateWithRedirectCallback />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/search',
        element: <SearchByOptions />,
      },
      {
        path: '/search/:category',
        element: <SearchByCategory />,
      },
      {
        path: '/listing-details/:id',
        element: <ListingDetails />,
      },
      {
        path: '/profile/:id',
        element: <PublicProfile />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/add-listing',
            element: <AddListing />,
          },
          {
            path: '/message',
            element: <Chats />,
          },
          {
            path: '/onboarding',
            element: <OnboardingPage />,
          },
          {
            path: '/auth/callback',
            element: <AuthCallbackPage />,
          },
        ],
      },
    ],
  },
]);
