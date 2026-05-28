import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { syncCurrentUser } from '@/shared/api/api';

const protectedMarketplacePaths = ['/add-listing', '/message'];

const hasCompleteProfile = (user?: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  profileComplete?: boolean;
}) => {
  if (!user) return false;
  if (user.profileComplete) return true;

  const hasValidRole = user.role === 'buyer' || user.role === 'seller' || user.role === 'dealer';
  return Boolean(
    user.name?.trim() &&
      user.email?.trim() &&
      user.phone?.trim() &&
      user.location?.trim() &&
      hasValidRole
  );
};

const AuthProfileGate = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const lastCheckedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const currentPath = `${location.pathname}${location.search}`;
    if (lastCheckedPath.current === currentPath) return;
    lastCheckedPath.current = currentPath;

    let cancelled = false;

    const checkProfile = async () => {
      try {
        const response = await syncCurrentUser();
        const profileComplete = hasCompleteProfile(response?.user);
        const isOnboarding = location.pathname === '/onboarding';
        const requiresCompleteProfile =
          location.pathname === '/profile' ||
          protectedMarketplacePaths.some((path) => location.pathname.startsWith(path));

        if (cancelled) return;

        if (!profileComplete && requiresCompleteProfile) {
          navigate(`/onboarding?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
          return;
        }

        if (
          profileComplete &&
          location.pathname.startsWith('/add-listing') &&
          response?.user?.role !== 'seller' &&
          response?.user?.role !== 'dealer'
        ) {
          navigate('/profile?tab=my-listing', { replace: true });
          return;
        }

        if (profileComplete && isOnboarding) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Unable to check marketplace profile:', error);
      }
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, location.pathname, location.search, navigate]);

  return null;
};

export default AuthProfileGate;
