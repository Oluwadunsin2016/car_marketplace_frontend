import { Check } from 'lucide-react';

const formatFeatureName = (value: string) => {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
};

const Features = ({
  features,
  loading,
}: {
  features: { [key: string]: boolean };
  loading: boolean;
}) => {
  const activeFeatures = Object.entries(features || {}).filter(([, value]) => value);

  return (
    <div>
      {loading ? (
        <div className="h-48 w-full animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Included equipment
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Features</h2>

          {activeFeatures.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeFeatures.map(([featureKey]) => (
                <div key={featureKey} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{formatFeatureName(featureKey)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No feature list has been added for this vehicle.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default Features;
