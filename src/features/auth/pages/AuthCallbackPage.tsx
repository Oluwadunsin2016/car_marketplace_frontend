import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { syncCurrentUser } from '@/shared/api/api';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const routeUser = async () => {
      try {
        const response = await syncCurrentUser();
        const profileComplete = Boolean(response?.user?.profileComplete);

        if (cancelled) return;
        navigate(profileComplete ? '/' : '/onboarding', { replace: true });
      } catch (error) {
        console.error('Unable to route authenticated user:', error);
        if (!cancelled) navigate('/onboarding', { replace: true });
      }
    };

    routeUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-slate-950 text-white">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Securing your marketplace session</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          We are checking whether your marketplace profile is ready.
        </p>
        <Loader2 className="mx-auto mt-6 size-6 animate-spin text-slate-500" />
      </div>
    </main>
  );
};

export default AuthCallbackPage;
