import { Button } from '@/shared/ui/button';
import { formatCurrency } from '@/shared/lib/format';
import { carListing } from '@/shared/types/marketplace';
import { BadgeDollarSign, CheckCircle2, MessageSquare, XCircle } from 'lucide-react';

const Pricing = ({ car, loading }: { car?: carListing; loading: boolean }) => {
  const isSold = car?.status === 'sold';

  return (
    <div>
      {loading ? (
        <div className="h-64 w-full animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <BadgeDollarSign className="size-5" />
            Asking price
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {formatCurrency(car?.sellingPrice || 0)}
          </p>
          <div className={`mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm font-semibold ${isSold ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {isSold ? <XCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            <span>{isSold ? 'This car has been sold and is no longer available.' : 'This car is currently available.'}</span>
          </div>
          {car?.originalPrice ? (
            <p className="mt-1 text-sm text-slate-500">
              Original price: <span className="line-through">{formatCurrency(car.originalPrice)}</span>
            </p>
          ) : null}

          <div className="mt-5 space-y-2 border-y border-slate-100 py-4 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Seller details available before contact
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Complete vehicle specs included
            </p>
          </div>

          <Button asChild={!isSold} size="lg" disabled={isSold} className="mt-5 w-full rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSold ? (
              <span>
                <MessageSquare className="size-4" />
                Conversation unavailable
              </span>
            ) : (
              <a href="#seller-contact">
              <MessageSquare className="size-4" />
              Start conversation
              </a>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pricing;
