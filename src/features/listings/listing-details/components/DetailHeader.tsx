
import { carListing } from '@/shared/types/marketplace';
import { CalendarDays, CheckCircle2, Fuel, Gauge, MapPin, Settings, ShieldCheck, XCircle } from 'lucide-react';

const DetailHeader = ({ car, loading }: { car?: carListing; loading: boolean }) => {
  const mileage = Number(car?.mileage || 0).toLocaleString();
  const isSold = car?.status === 'sold';

  return (
    <div>
      {loading ? (
        <div>
          <div className="mb-3 h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mb-3 h-10 w-full max-w-xl animate-pulse rounded bg-slate-200" />
          <div className="mb-5 h-5 w-full max-w-md animate-pulse rounded bg-slate-200" />
          <div className="flex flex-wrap gap-2">
            {Array(4)
              .fill('spec')
              .map((_, index) => (
                <div key={index} className="h-9 w-28 animate-pulse rounded-md bg-slate-200" />
              ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <ShieldCheck className="size-4" />
              Verified listing
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold ${isSold ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {isSold ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
              {isSold ? 'Sold out' : 'Available'}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {car?.make} {car?.model}
            </span>
          </div>

          <div className="mt-4 max-w-4xl">
            <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              {car?.listingTitle}
            </h1>
            {car?.tagLine ? (
              <p className="mt-3 text-base leading-7 text-slate-600">{car.tagLine}</p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Year', value: car?.year, icon: CalendarDays },
              { label: 'Mileage', value: `${mileage} miles`, icon: Gauge },
              { label: 'Transmission', value: car?.transmission, icon: Settings },
              { label: 'Fuel', value: car?.fuelType, icon: Fuel },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Icon className="size-4 text-blue-700" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-950">{item.value || 'Not specified'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailHeader;
