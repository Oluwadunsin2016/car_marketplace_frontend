import { SignIn } from '@clerk/clerk-react';
import { authAppearance } from '../clerkAppearance';

const SignInPage = () => {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/auth/callback"
      appearance={authAppearance}
    />
  );
};

export default SignInPage;
