import { CarFront, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetSavedCars } from "@/shared/api/hooks";
import CarItem from "@/shared/components/marketing/CarItem";
import { carListing } from "@/shared/types/marketplace";
import { Button } from "@/shared/ui/button";
import { CarGridSkeleton, EmptyState, ErrorState } from "@/shared/ui/state";

const SavedCars = () => {
  const { data, isLoading, isError, refetch } = useGetSavedCars();
  const cars = data?.cars || [];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Buyer shortlist</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Saved cars</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep interesting vehicles in one place while you compare pricing, sellers, and specifications.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Heart className="size-4 text-red-500" />
              Saved
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{cars.length}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <CarGridSkeleton count={3} className="xl:grid-cols-3" />
      ) : isError ? (
        <ErrorState
          title="Saved cars could not be loaded"
          description="Your shortlist did not respond. Try again once your connection is stable."
          onRetry={() => refetch()}
        />
      ) : cars.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cars.map((car: carListing) => (
            <CarItem key={String(car.id)} car={car} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CarFront className="size-5" />}
          title="No saved cars yet"
          description="Save cars from inventory pages and return here when you are ready to compare or contact sellers."
          action={
            <Button asChild className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
              <Link to="/search">Browse inventory</Link>
            </Button>
          }
        />
      )}
    </section>
  );
};

export default SavedCars;
