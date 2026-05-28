import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();

  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={location.pathname + location.search} />
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;
