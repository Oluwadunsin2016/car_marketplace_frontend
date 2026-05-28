import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { carMakes, pricing } from '@/shared/config/data';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/lib/format';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [cars, setCars] = useState('');
  const [make, setMake] = useState('');
  const [price, setPrice] = useState('');

  const query = new URLSearchParams();
  if (cars) query.set('cars', cars);
  if (make) query.set('make', make);
  if (price) query.set('price', price);
  const searchPath = `/search${query.toString() ? `?${query.toString()}` : ''}`;

  return (
    <div className="w-full rounded-lg border border-white/20 bg-white p-3 shadow-2xl shadow-slate-950/20">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Condition
          </span>
          <Select onValueChange={(value) => setCars(value)}>
            <SelectTrigger className="h-11 border-slate-200 text-sm shadow-none">
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white">
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Make
          </span>
          <Select onValueChange={(value) => setMake(value)}>
            <SelectTrigger className="h-11 border-slate-200 text-sm shadow-none">
              <SelectValue placeholder="All makes" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white">
              {carMakes.map((car) => (
                <SelectItem key={car.id} value={car.name}>
                  {car.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Budget
          </span>
          <Select onValueChange={(value) => setPrice(value)}>
            <SelectTrigger className="h-11 border-slate-200 text-sm shadow-none">
              <SelectValue placeholder="Any budget" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white">
              {pricing.map((car) => (
                <SelectItem key={car.id} value={car.amount}>
                  Up to {formatCurrency(car.amount)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link
          to={searchPath}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <SearchIcon className="size-4" />
          Search
        </Link>
      </div>
    </div>
  );
};

export default Search;
