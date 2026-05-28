import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Search from './Search';
import { useUser } from '@clerk/clerk-react';
import { useSyncCurrentUser } from '@/shared/api/hooks';

const Hero = () => {
  const { isSignedIn } = useUser();
  const { data: profileData } = useSyncCurrentUser(Boolean(isSignedIn));
  const marketplaceRole = profileData?.user?.role;
  const canSell = !isSignedIn || marketplaceRole === 'seller' || marketplaceRole === 'dealer';

  return (
    <section className="relative min-h-[620px] overflow-hidden bg-slate-950">
      <img
        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=85"
        alt="Performance car on an open road"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl py-8 text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck className="size-4 text-emerald-300" />
            Verified sellers, clean listings, serious buyers
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            Buy and sell quality cars with confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Explore inspected vehicles from trusted sellers, compare pricing, and contact owners from one focused marketplace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Browse inventory
              <ArrowRight className="size-4" />
            </Link>
            {canSell ? (
              <Link
                to="/add-listing"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Sparkles className="size-4" />
                List your vehicle
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-auto">
          <Search />
        </div>
      </div>
    </section>
  );
};

export default Hero;
