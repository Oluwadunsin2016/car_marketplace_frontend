import { FormEvent, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BadgeCheck, Camera, Loader2, Mail, MapPin, Pencil, Phone, Store, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { useSyncCurrentUser, useUpdateCurrentUserProfile } from '@/shared/api/hooks';
import { MarketplaceUserProfilePayload } from '@/shared/types/marketplace';
import { ErrorState, PanelSkeleton } from '@/shared/ui/state';

const roleOptions: Array<{ label: string; value: MarketplaceUserProfilePayload['role'] }> = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Dealer', value: 'dealer' },
];

const defaultUserImage = '/assets/images/default_user_image.png';

const ProfileDetails = () => {
  const { user: clerkUser } = useUser();
  const { data, isLoading, isError, refetch } = useSyncCurrentUser();
  const updateProfile = useUpdateCurrentUserProfile();
  const marketplaceUser = data?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState<MarketplaceUserProfilePayload>({
    name: '',
    phone: '',
    location: '',
    dealerName: '',
    role: 'buyer',
  });

  const getProfileForm = (): MarketplaceUserProfilePayload => ({
    name: marketplaceUser?.name || '',
    phone: marketplaceUser?.phone || '',
    location: marketplaceUser?.location || '',
    dealerName: marketplaceUser?.dealerName || '',
    role: marketplaceUser?.role === 'seller' || marketplaceUser?.role === 'dealer' || marketplaceUser?.role === 'buyer'
      ? marketplaceUser.role
      : 'buyer',
  });

  useEffect(() => {
    if (!marketplaceUser) return;

    setForm(getProfileForm());
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
  }, [marketplaceUser]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const nextPreview = URL.createObjectURL(selectedImage);
    setImagePreview(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [selectedImage]);

  const updateField = (field: keyof MarketplaceUserProfilePayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.location.trim()) {
      toast.error('Name, phone, and location are required.');
      return;
    }

    if (form.role === 'dealer' && !form.dealerName?.trim()) {
      toast.error('Dealer name is required for dealer profiles.');
      return;
    }

    const payload = new FormData();
    payload.append('name', form.name.trim());
    payload.append('phone', form.phone.trim());
    payload.append('location', form.location.trim());
    payload.append('role', form.role);
    payload.append('dealerName', form.role === 'dealer' ? form.dealerName?.trim() || '' : '');
    if (selectedImage) payload.append('image', selectedImage);

    await updateProfile.mutateAsync(payload);
    setIsEditing(false);
    setSelectedImage(null);
    toast.success('Profile details updated.');
  };

  const cancelEditing = () => {
    setForm(getProfileForm());
    setSelectedImage(null);
    setIsEditing(false);
  };

  const fieldClassName = `h-11 rounded-md border px-3 text-sm font-normal outline-none transition ${
    isEditing
      ? 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
      : 'border-slate-200 bg-slate-50 text-slate-600'
  }`;

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <PanelSkeleton className="h-72" />
        <PanelSkeleton className="h-72" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Profile details could not be loaded"
        description="We could not retrieve your marketplace profile. Try again before editing your account."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={imagePreview || marketplaceUser?.imageUrl || clerkUser?.imageUrl || defaultUserImage}
              alt={marketplaceUser?.name || 'Profile'}
              className="size-20 rounded-full object-cover ring-4 ring-slate-100"
            />
            {isEditing ? (
              <label className="absolute -bottom-1 -right-1 grid size-8 cursor-pointer place-items-center rounded-full border border-white bg-slate-950 text-white shadow-sm transition hover:bg-slate-800">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                />
              </label>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-slate-950">{marketplaceUser?.name || 'Marketplace user'}</p>
            <p className="truncate text-sm text-slate-500">{marketplaceUser?.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700">
              <BadgeCheck className="size-3.5" />
              {marketplaceUser?.role || 'user'}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm">
          <p className="flex items-center gap-3 text-slate-600">
            <Mail className="size-4 text-slate-400" />
            <span className="truncate">{marketplaceUser?.email || 'No email'}</span>
          </p>
          <p className="flex items-center gap-3 text-slate-600">
            <Phone className="size-4 text-slate-400" />
            <span>{marketplaceUser?.phone || 'No phone number'}</span>
          </p>
          <p className="flex items-center gap-3 text-slate-600">
            <MapPin className="size-4 text-slate-400" />
            <span>{marketplaceUser?.location || 'No location'}</span>
          </p>
          {marketplaceUser?.dealerName ? (
            <p className="flex items-center gap-3 text-slate-600">
              <Store className="size-4 text-slate-400" />
              <span>{marketplaceUser.dealerName}</span>
            </p>
          ) : null}
        </div>
      </aside>

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Profile details</h2>
            <p className="mt-1 text-sm text-slate-500">Keep your seller and buyer information accurate.</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="grid size-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Edit profile details"
            >
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Full name
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={!isEditing}
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Phone number
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              disabled={!isEditing}
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Location
            <input
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
              disabled={!isEditing}
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Account type
            <select
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              disabled={!isEditing}
              className={fieldClassName}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          {form.role === 'dealer' ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Dealer name
              <input
                value={form.dealerName || ''}
                onChange={(event) => updateField('dealerName', event.target.value)}
                disabled={!isEditing}
                className={fieldClassName}
              />
            </label>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={cancelEditing} disabled={updateProfile.isPending} className="rounded-md">
              <X className="size-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending} className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
              {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserRound className="size-4" />}
              Save profile
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default ProfileDetails;
