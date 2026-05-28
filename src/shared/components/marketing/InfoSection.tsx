import { BadgeCheck, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetAllCars } from '@/shared/api/hooks';

const InfoSection  = () => {
  const { data, isPending } = useGetAllCars({ page: 1, limit: 1 });
  const marketplaceListingCount = data?.pagination?.totalItems ?? data?.cars?.length ?? 0;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Built for serious transactions
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            A calmer way to compare cars, sellers, and value.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Triumphant Cars keeps the marketplace focused on complete listings, clear vehicle specs, and direct seller contact so buyers can move from discovery to decision without noise.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Verified seller profiles', icon: BadgeCheck },
              { label: 'Complete vehicle specifications', icon: ShieldCheck },
              { label: 'Fast owner messaging', icon: MessageCircle },
              { label: 'Fresh inventory updates', icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8">
            <Link
              to="/search"
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Explore the marketplace
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <img
            alt="Luxury SUV interior"
            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=85"
            className="h-72 w-full rounded-lg object-cover sm:h-full"
          />
          <div className="grid gap-4">
            <div className="rounded-lg bg-slate-950 p-6 text-white">
              <p className="text-4xl font-bold">{isPending ? '...' : marketplaceListingCount}</p>
              <p className="mt-2 text-sm text-slate-300">Cars available in the marketplace</p>
            </div>
            <img
              alt="Car dashboard"
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=85"
              className="h-52 w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
