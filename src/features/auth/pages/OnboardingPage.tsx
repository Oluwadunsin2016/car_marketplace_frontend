import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { Building2, CheckCircle2, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useSyncCurrentUser, useUpdateCurrentUserProfile } from '@/shared/api/hooks';
import { MarketplaceUser, MarketplaceUserProfilePayload } from '@/shared/types/marketplace';

const roles: Array<{
  value: MarketplaceUserProfilePayload['role'];
  label: string;
  description: string;
}> = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Browse cars, contact sellers, and manage your buying activity.',
  },
  {
    value: 'seller',
    label: 'Private seller',
    description: 'List personal vehicles and message interested buyers.',
  },
  {
    value: 'dealer',
    label: 'Dealer',
    description: 'Represent a dealership and manage a professional seller profile.',
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: clerkUser } = useUser();
  const { data, isPending } = useSyncCurrentUser();
  const { mutateAsync, isPending: isSaving } = useUpdateCurrentUserProfile();
  const user = data?.user as MarketplaceUser | undefined;
  const [form, setForm] = useState<MarketplaceUserProfilePayload>({
    name: '',
    phone: '',
    location: '',
    dealerName: '',
    role: 'buyer',
  });

  useEffect(() => {
    const clerkName =
      clerkUser?.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
      clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      '';

    if (!user && !clerkName) return;

    setForm({
      name: user?.name || clerkName,
      phone: user?.phone || '',
      location: user?.location || '',
      dealerName: user?.dealerName || '',
      role: user?.role === 'seller' || user?.role === 'dealer' || user?.role === 'buyer' ? user.role : 'buyer',
    });
  }, [clerkUser, user]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.value === form.role) || roles[0],
    [form.role]
  );

  const updateField = (field: keyof MarketplaceUserProfilePayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.location.trim()) {
      toast.error('Please complete your name, phone, and location.');
      return;
    }

    if (form.role === 'dealer' && !form.dealerName?.trim()) {
      toast.error('Please enter your dealership name.');
      return;
    }

    const response = await mutateAsync({
      ...form,
      dealerName: form.role === 'dealer' ? form.dealerName?.trim() || null : null,
    });

    if (!response?.user?.profileComplete) {
      const missingFields = response?.user?.missingProfileFields || [];
      const message = missingFields.length
        ? `Still missing: ${missingFields.join(', ')}.`
        : 'Your profile was saved, but it is still missing required details.';
      toast.error(message);
      return;
    }

    const redirectTo = searchParams.get('redirect') || '/';
    toast.success('Profile completed.');
    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="relative hidden overflow-hidden rounded-lg bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <img
            src="https://images.unsplash.com/photo-1562141961-3ef251b63f5f?auto=format&fit=crop&w=1400&q=85"
            alt="Car showroom"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-emerald-300" />
              Final step
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-normal">
              Complete your marketplace profile.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Google or email gets you signed in. These details help buyers and sellers trust who they are speaking with.
            </p>
          </div>
          <div className="relative grid gap-3">
            {[
              'Verified contact details',
              'Better seller confidence',
              'Ready for messaging and listings',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-4">
                <CheckCircle2 className="size-5 text-emerald-300" />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Marketplace profile
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Tell us how you will use Triumphant Cars</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your sign-in is active. Add the details buyers and sellers need before you start listing or messaging.
              </p>
            </div>

            {isPending ? (
              <div className="space-y-4">
                {Array(5)
                  .fill('field')
                  .map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-md bg-slate-200" />
                  ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound className="size-4" />
                      Full name
                    </span>
                    <Input
                      value={form.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      className="h-11 rounded-md border-slate-200"
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Phone className="size-4" />
                      Phone number
                    </span>
                    <Input
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      className="h-11 rounded-md border-slate-200"
                      placeholder="+234..."
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MapPin className="size-4" />
                    Location
                  </span>
                  <Input
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    className="h-11 rounded-md border-slate-200"
                    placeholder="City, State"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Account type</span>
                  <div className="grid gap-3 md:grid-cols-3">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => updateField('role', role.value)}
                        className={`rounded-lg border p-4 text-left transition ${
                          form.role === role.value
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm font-bold">{role.label}</span>
                        <span className={`mt-2 block text-xs leading-5 ${form.role === role.value ? 'text-white/70' : 'text-slate-500'}`}>
                          {role.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {form.role === 'dealer' ? (
                  <label className="block">
                    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Building2 className="size-4" />
                      Dealership name
                    </span>
                    <Input
                      value={form.dealerName || ''}
                      onChange={(event) => updateField('dealerName', event.target.value)}
                      className="h-11 rounded-md border-slate-200"
                      placeholder="Your dealership name"
                    />
                  </label>
                ) : null}

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Selected: <span className="font-semibold text-slate-950">{selectedRole.label}</span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 flex-1 rounded-md bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {isSaving ? 'Saving profile...' : 'Complete profile'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-md border-slate-300 bg-white"
                    onClick={() => navigate('/', { replace: true })}
                  >
                    Skip for now
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default OnboardingPage;
