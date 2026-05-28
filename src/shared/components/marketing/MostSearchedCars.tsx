import CarItem from './CarItem';
import { useGetPopularCars } from '@/shared/api/hooks';
import { carListing } from '@/shared/types/marketplace';
import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

const MostSearchedCars = () => {
  const { data, isPending } = useGetPopularCars({ limit: 8 });

  return (
    <section className="bg-[#f7f8fb] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Featured inventory
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Popular cars ready to inspect
            </h2>
          </div>
          <Link to="/search" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            Browse all cars
          </Link>
        </div>

        {isPending ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array(8)
              .fill('car')
              .map((_, i) => (
                <div key={i} className="h-[360px] animate-pulse rounded-lg bg-slate-200" />
              ))}
          </div>
        ) : data?.cars?.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.cars.map((car: carListing) => (
              <CarItem key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-500">
            <CarFront className="size-8" />
            <p className="mt-2 text-sm font-medium">No cars available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MostSearchedCars;
