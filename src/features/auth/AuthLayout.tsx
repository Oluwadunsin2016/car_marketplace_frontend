import { Outlet } from 'react-router-dom';
import { BadgeCheck, CarFront, Gauge, ShieldCheck } from 'lucide-react';

const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85"
          alt="Premium vehicle showroom"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/65" />

        <div className="relative flex min-h-screen flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-white">
              <img src="/logo.svg" alt="Triumphant Cars" className="size-7" />
            </span>
            <div>
              <p className="text-lg font-bold">Triumphant Cars</p>
              <p className="text-sm text-white/60">Verified marketplace access</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="size-4 text-emerald-300" />
              Sign in securely with Google or email
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-normal">
              Manage listings, message sellers, and buy with confidence.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
              Your account keeps your conversations, saved marketplace actions, and seller tools protected across every device.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {[
              ['Google access', BadgeCheck],
              ['Seller tools', CarFront],
              ['Fast buying', Gauge],
            ].map(([label, Icon]) => {
              const ItemIcon = Icon as typeof BadgeCheck;
              return (
                <div key={label as string} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <ItemIcon className="size-5 text-blue-200" />
                  <p className="mt-3 text-sm font-semibold">{label as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 py-8 text-slate-950 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-lg bg-slate-950">
              <img src="/logo.svg" alt="Triumphant Cars" className="size-7" />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-950">Triumphant Cars</p>
              <p className="text-sm text-slate-500">Verified marketplace access</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
