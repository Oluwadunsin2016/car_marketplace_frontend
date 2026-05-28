import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteCarsByCategory } from '@/shared/api/hooks';
import { carListing } from '@/shared/types/marketplace';
import CarItem from '@/shared/components/marketing/CarItem';
import Search from '@/shared/components/marketing/Search';
import { CarFront, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { CarGridSkeleton, EmptyState, ErrorState } from '@/shared/ui/state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Lowest mileage', value: 'mileage-asc' },
  { label: 'Newest model year', value: 'year-desc' },
] as const;

const SearchByCategory = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';
  const maxMileage = searchParams.get('maxMileage') || '';
  const [filters, setFilters] = useState({ sort, minPrice, maxPrice, minYear, maxYear, maxMileage });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isPending,
    refetch,
  } = useInfiniteCarsByCategory(category, 12, {
    sort,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
  });
  const cars = useMemo(
    () => data?.pages.flatMap((page) => page?.cars || []) || [],
    [data?.pages]
  );
  const totalItems = data?.pages?.[0]?.pagination?.totalItems ?? cars.length;

  useEffect(() => {
    setFilters({ sort, minPrice, maxPrice, minYear, maxYear, maxMileage });
  }, [sort, minPrice, maxPrice, minYear, maxYear, maxMileage]);

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = () => {
    const nextParams = new URLSearchParams();
    if (filters.sort && filters.sort !== 'newest') nextParams.set('sort', filters.sort);
    if (filters.minPrice) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice);
    if (filters.minYear) nextParams.set('minYear', filters.minYear);
    if (filters.maxYear) nextParams.set('maxYear', filters.maxYear);
    if (filters.maxMileage) nextParams.set('maxMileage', filters.maxMileage);
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setFilters({ sort: 'newest', minPrice: '', maxPrice: '', minYear: '', maxYear: '', maxMileage: '' });
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
              Browse category
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">{category}</h1>
          </div>
          <Search />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-950">{category} cars</h2>
          <p className="mt-1 text-sm text-slate-600">
            Showing {cars.length} of {totalItems} listings available
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <SlidersHorizontal className="size-4 text-blue-700" />
              Refine {category}
            </h3>
            <Button type="button" variant="ghost" onClick={clearFilters} className="h-9 rounded-md text-slate-500">
              <X className="size-4" />
              Clear
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Select value={filters.sort || 'newest'} onValueChange={(value) => updateFilter('sort', value)}>
              <SelectTrigger className="h-11 rounded-md border-slate-200 bg-slate-50 xl:col-span-2"><SelectValue placeholder="Sort" /></SelectTrigger>
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
            title={`${category || 'Category'} listings could not be loaded`}
            description="We could not retrieve this category right now. Try again in a moment."
            onRetry={() => refetch()}
          />
        ) : cars.length > 0 ? (
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
            title="No cars available in this category"
            description="Try another category or clear the filters to broaden the results."
            action={
              <Button type="button" onClick={clearFilters} className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default SearchByCategory;
