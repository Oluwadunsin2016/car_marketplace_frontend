import { SignUp } from '@clerk/clerk-react';
import { authAppearance } from '../clerkAppearance';

const SignUpPage = () => {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/auth/callback"
      appearance={authAppearance}
    />
  );
};

export default SignUpPage;
