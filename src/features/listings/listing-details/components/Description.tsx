import { carListing } from '@/shared/types/marketplace';

const Description = ({ car, loading }: { car?: carListing; loading: boolean }) => {
  return (
    <div>
      {loading ? (
        <div className="h-40 w-full animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Seller notes
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Description</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {car?.listingDescription || 'No description has been added for this vehicle.'}
          </p>
        </section>
      )}
    </div>
  );
};

export default Description;
