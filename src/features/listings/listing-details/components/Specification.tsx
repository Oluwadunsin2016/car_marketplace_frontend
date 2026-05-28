import CarSpecification from '@/shared/config/CarSpecification';
import IconField from '../../add-listing/components/IconField';

type carListing = Record<string, any>;
const Specification = ({ car, loading }: { car?: carListing; loading: boolean }) => {
  return (
    <div>
      {loading ? (
        <div className="h-[32rem] w-full animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Vehicle information
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Specifications</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CarSpecification?.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-600">
                  <IconField iconName={item.icon} />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="text-right text-sm font-bold text-slate-950">
                  {car?.[item.name as keyof carListing] || 'Not specified'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Specification;
