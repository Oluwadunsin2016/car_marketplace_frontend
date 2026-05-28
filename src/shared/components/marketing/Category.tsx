import { category } from '@/shared/config/data';
import { Link } from 'react-router-dom';

const Category = () => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Browse by body type
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Find the right car faster
            </h2>
          </div>
          <Link to="/search" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            View all inventory
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {category.map((cat, i) => (
            <Link
              to={`/search/${cat.name}`}
              key={`${cat.name}-${i}`}
              className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <img src={cat.icon} alt="" className="size-9" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;
