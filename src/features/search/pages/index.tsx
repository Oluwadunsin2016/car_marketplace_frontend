import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteCarsByOptions } from '@/shared/api/hooks';
import Search from '@/shared/components/marketing/Search';
import { carListing } from '@/shared/types/marketplace';
import CarItem from '@/shared/components/marketing/CarItem';
import { CarFront, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CarGridSkeleton, EmptyState, ErrorState } from '@/shared/ui/state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

const categoryOptions = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Hatchback', 'Electric', 'Hybrid'];
const fuelOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissionOptions = ['Automatic', 'Manual', 'CVT'];
const conditionOptions = ['New', 'Used', 'Certified Pre-Owned'];
const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Lowest mileage', value: 'mileage-asc' },
  { label: 'Newest model year', value: 'year-desc' },
] as const;

const SearchByOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const condition = searchParams.get('cars');
  const make = searchParams.get('make');
  const sellingPrice = searchParams.get('price');
  const category = searchParams.get('category');
  const fuelType = searchParams.get('fuelType');
  const transmission = searchParams.get('transmission');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice') || sellingPrice;
  const minYear = searchParams.get('minYear');
  const maxYear = searchParams.get('maxYear');
  const maxMileage = searchParams.get('maxMileage');
  const sort = searchParams.get('sort') || 'newest';
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState({
    category: category || '',
    condition: condition || '',
    fuelType: fuelType || '',
    make: make || '',
    maxMileage: maxMileage || '',
    maxPrice: maxPrice || '',
    maxYear: maxYear || '',
    minPrice: minPrice || '',
    minYear: minYear || '',
    sort,
    transmission: transmission || '',
  });
  const queryPayload = useMemo(() => ({
    category,
    condition,
    fuelType,
    make,
    maxMileage,
    maxPrice,
    maxYear,
    minPrice,
    minYear,
    sellingPrice,
    sort,
    transmission,
  }), [category, condition, fuelType, make, maxMileage, maxPrice, maxYear, minPrice, minYear, sellingPrice, sort, transmission]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isPending,
    refetch,
  } = useInfiniteCarsByOptions(queryPayload);

  const cars = useMemo(
    () => data?.pages.flatMap((page) => page?.cars || []) || [],
    [data?.pages]
  );
  const totalItems = data?.pages?.[0]?.pagination?.totalItems ?? cars.length;

  useEffect(() => {
    setFilters({
      category: category || '',
      condition: condition || '',
      fuelType: fuelType || '',
      make: make || '',
      maxMileage: maxMileage || '',
      maxPrice: maxPrice || '',
      maxYear: maxYear || '',
      minPrice: minPrice || '',
      minYear: minYear || '',
      sort,
      transmission: transmission || '',
    });
  }, [category, condition, fuelType, make, maxMileage, maxPrice, maxYear, minPrice, minYear, sort, transmission]);

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = () => {
    const nextParams = new URLSearchParams();
    if (filters.condition) nextParams.set('cars', filters.condition);
    if (filters.make) nextParams.set('make', filters.make);
    if (filters.category) nextParams.set('category', filters.category);
    if (filters.fuelType) nextParams.set('fuelType', filters.fuelType);
    if (filters.transmission) nextParams.set('transmission', filters.transmission);
    if (filters.minPrice) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice);
    if (filters.minYear) nextParams.set('minYear', filters.minYear);
    if (filters.maxYear) nextParams.set('maxYear', filters.maxYear);
    if (filters.maxMileage) nextParams.set('maxMileage', filters.maxMileage);
    if (filters.sort && filters.sort !== 'newest') nextParams.set('sort', filters.sort);
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      fuelType: '',
      make: '',
      maxMileage: '',
      maxPrice: '',
      maxYear: '',
      minPrice: '',
      minYear: '',
      sort: 'newest',
      transmission: '',
    });
    setSearchParams({});
  };

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '360px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="bg-[#f7f8fb]">
      <div className="bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
              Inventory search
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Find your next vehicle</h1>
          </div>
          <Search />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Search results</h2>
            <p className="mt-1 text-sm text-slate-600">
              Showing {cars.length} of {totalItems} listings that match your filters
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <SlidersHorizontal className="size-4 text-blue-700" />
              Refine inventory
            </h3>
            <Button type="button" variant="ghost" onClick={clearFilters} className="h-9 rounded-md text-slate-500">
              <X className="size-4" />
              Clear
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Select value={filters.condition || undefined} onValueChange={(value) => updateFilter('condition', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50"><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent className="bg-white">{conditionOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.category || undefined} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50"><SelectValue placeholder="Body type" /></SelectTrigger>
              <SelectContent className="bg-white">{categoryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.fuelType || undefined} onValueChange={(value) => updateFilter('fuelType', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50"><SelectValue placeholder="Fuel type" /></SelectTrigger>
              <SelectContent className="bg-white">{fuelOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.transmission || undefined} onValueChange={(value) => updateFilter('transmission', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50"><SelectValue placeholder="Transmission" /></SelectTrigger>
              <SelectContent className="bg-white">{transmissionOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.sort || 'newest'} onValueChange={(value) => updateFilter('sort', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent className="bg-white">{sortOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <input value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} inputMode="numeric" placeholder="Min price" className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
            <input value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} inputMode="numeric" placeholder="Max price" className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
            <input value={filters.minYear} onChange={(event) => updateFilter('minYear', event.target.value)} inputMode="numeric" placeholder="Min year" className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
            <input value={filters.maxYear} onChange={(event) => updateFilter('maxYear', event.target.value)} inputMode="numeric" placeholder="Max year" className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
            <input value={filters.maxMileage} onChange={(event) => updateFilter('maxMileage', event.target.value)} inputMode="numeric" placeholder="Max mileage" className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={applyFilters} className="h-11 rounded-md bg-slate-950 px-5 text-white hover:bg-slate-800">
              Apply filters
            </Button>
          </div>
        </div>

        {isPending ? (
          <CarGridSkeleton count={8} />
        ) : isError ? (
          <ErrorState
            title="Inventory could not be loaded"
            description="The marketplace listings did not respond. Try again, or check your connection if you are offline."
            onRetry={() => refetch()}
          />
        ) : (
          <div>
            {cars.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {cars.map((car: carListing) => (
                    <CarItem key={car.id} car={car} />
                  ))}
                </div>
                <div ref={loadMoreRef} className="mt-8 flex min-h-12 items-center justify-center">
                  {isFetchingNextPage ? (
                    <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                      <Loader2 className="size-4 animate-spin" />
                      Loading more cars
                    </span>
                  ) : hasNextPage ? (
                    <span className="text-sm font-medium text-slate-500">Scroll to load more cars</span>
                  ) : (
                    <span className="text-sm font-medium text-slate-500">All matching listings loaded</span>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CarFront className="size-5" />}
                title="No cars match this search"
                description="Adjust your filters or clear the search to see more vehicles."
                action={
                  <Button type="button" onClick={clearFilters} className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
                    Clear filters
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchByOptions;
