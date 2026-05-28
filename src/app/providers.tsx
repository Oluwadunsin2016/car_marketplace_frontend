import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/shared/ui/sonner';
import { router } from '@/app/router';
import { setAuthTokenGetter } from '@/shared/api/client';
import { syncCurrentUser } from '@/shared/api/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: 'always',
      retry: 1,
    },
  },
});
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Publishable Key');
}

export const AppProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
        <ApiAuthBridge />
        <OnlineRefetchBridge />
        {children ?? <RouterProvider router={router} />}
        <Toaster />
      </ClerkProvider>
    </QueryClientProvider>
  );
};

const OnlineRefetchBridge = () => {
  const queryClient = useQueryClient();
  const wasOfflineRef = useRef(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const markOffline = () => {
      wasOfflineRef.current = true;
    };

    const refreshBackendData = () => {
      queryClient.resumePausedMutations();
      queryClient.invalidateQueries();
      window.setTimeout(() => {
        queryClient.refetchQueries({ type: 'active' });
      }, 150);

      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        window.setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };

    window.addEventListener('offline', markOffline);
    window.addEventListener('online', refreshBackendData);
    return () => {
      window.removeEventListener('offline', markOffline);
      window.removeEventListener('online', refreshBackendData);
    };
  }, [queryClient]);

  return null;
};

const ApiAuthBridge = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());

    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    syncCurrentUser().catch((error) => {
      console.error('Unable to sync marketplace user:', error);
    });
  }, [isSignedIn, user?.id]);

  return null;
};
