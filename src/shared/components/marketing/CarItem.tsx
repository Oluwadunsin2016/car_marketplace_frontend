import { Fuel, Gauge, Heart, MapPin, Settings } from 'lucide-react';
import { MouseEvent } from 'react';
import { carListing } from '@/shared/types/marketplace';
import { formatCurrency, notifier } from '@/shared/lib/format';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useGetSavedCars, useSaveCar, useUnsaveCar } from '@/shared/api/hooks';
import { cn } from '@/shared/lib/utils';

const conditionStyles: Record<string, string> = {
  New: 'bg-emerald-100 text-emerald-800',
  Used: 'bg-amber-100 text-amber-800',
  'Certified Pre-Owned': 'bg-blue-100 text-blue-800',
};

const CarItem = ({ car }: { car: carListing }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { data: savedCarsData } = useGetSavedCars(Boolean(isSignedIn));
  const saveCar = useSaveCar();
  const unsaveCar = useUnsaveCar();
  const image =
    car?.carImages?.[0] ||
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80';
  const mileage = Number(car?.mileage || 0).toLocaleString();
  const carId = String(car?.id || '');
  const savedIds = (savedCarsData?.savedCarIds || []).map(String);
  const isSaved = savedIds.includes(carId);
  const isSaving = saveCar.isPending || unsaveCar.isPending;
  const isSold = car?.status === 'sold';

  const toggleSaved = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    try {
      if (isSaved) {
        await unsaveCar.mutateAsync(carId);
        notifier({ message: 'Removed from saved cars', type: 'success' });
      } else {
        await saveCar.mutateAsync(carId);
        notifier({ message: 'Saved car added to your profile', type: 'success' });
      }
    } catch (error) {
      notifier({ message: 'Unable to update saved cars', type: 'error' });
    }
  };

  return (
    <Link
      to={`/listing-details/${car?.id}`}
      className="group block h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/80"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={car?.listingTitle}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold ${
            conditionStyles[car?.condition] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {car?.condition}
        </span>
        <span
          className={cn(
            "absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-bold shadow-sm",
            isSold ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          )}
        >
          {isSold ? "Sold out" : "Available"}
        </span>
        <button
          type="button"
          onClick={toggleSaved}
          disabled={isSaving || !carId}
          aria-label={isSaved ? 'Remove saved car' : 'Save car'}
          className={cn(
            'absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/70 bg-white/95 text-slate-700 shadow-sm transition hover:scale-105 hover:text-red-600 disabled:opacity-60',
            isSaved && 'text-red-600'
          )}
        >
          <Heart className={cn('size-4', isSaved && 'fill-current')} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">
              {car?.listingTitle}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="size-3.5" />
              {car?.make} {car?.model}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs text-slate-600">
          <span className="flex min-w-0 items-center gap-1.5">
            <Gauge className="size-4 text-slate-400" />
            <span className="truncate">{mileage} mi</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Fuel className="size-4 text-slate-400" />
            <span className="truncate">{car?.fuelType}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Settings className="size-4 text-slate-400" />
            <span className="truncate">{car?.transmission}</span>
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Price</p>
            <p className="text-lg font-bold text-slate-950">{formatCurrency(car?.sellingPrice)}</p>
          </div>
          <span className="text-sm font-semibold text-blue-700">View details</span>
        </div>
      </div>
    </Link>
  );
};

export default CarItem;
