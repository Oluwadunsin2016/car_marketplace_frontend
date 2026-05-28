import { useOpenDirectConversation, useGetPublicUserProfile } from "@/shared/api/hooks";
import CarItem from "@/shared/components/marketing/CarItem";
import { Button } from "@/shared/ui/button";
import { CarGridSkeleton, EmptyState, ErrorState, PanelSkeleton } from "@/shared/ui/state";
import { carListing, MarketplaceUser } from "@/shared/types/marketplace";
import { notifier } from "@/shared/lib/format";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, CarFront, Loader2, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Store, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const defaultUserImage = "/assets/images/default_user_image.png";

type PublicProfileResponse = {
  profile: MarketplaceUser & {
    createdAt?: string;
    listingCount?: number;
  };
  cars: carListing[];
};

const roleLabel = (role?: string) => {
  if (role === "dealer") return "Dealer";
  if (role === "seller") return "Seller";
  if (role === "buyer") return "Buyer";
  return "Marketplace user";
};

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const openDirectConversation = useOpenDirectConversation();
  const { data, isLoading, isError } = useGetPublicUserProfile(id);
  const response = data as PublicProfileResponse | undefined;
  const profile = response?.profile;
  const cars = response?.cars || [];
  const isOwnProfile = user?.primaryEmailAddress?.emailAddress === profile?.email;
  const canMessageProfile = profile?.role === "seller" || profile?.role === "dealer";

  const messageSeller = async () => {
    if (!profile || !canMessageProfile || isOwnProfile) return;

    const profileId = encodeURIComponent(String(profile.appUserId || profile.id || profile.email));

    if (!isSignedIn) {
      navigate(`/message?recipientId=${profileId}`);
      return;
    }

    try {
      const data = await openDirectConversation.mutateAsync({
        creator: {
          id: profile.id,
          appUserId: profile.appUserId,
          name: profile.name,
          email: profile.email,
          imageUrl: profile.imageUrl,
        },
      });
      navigate(`/message?conversationId=${data.conversation._id}`);
    } catch (error) {
      notifier({ message: "Unable to open this conversation", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto my-10 min-h-[70vh] max-w-7xl px-4 sm:px-6 lg:px-8">
        <PanelSkeleton className="h-72" />
        <CarGridSkeleton count={3} className="mt-6 lg:grid-cols-3" />
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="mx-auto my-10 min-h-[70vh] max-w-3xl px-4 sm:px-6 lg:px-8">
        <ErrorState
          icon={<UserRound className="size-5" />}
          title="Profile not found"
          description="This marketplace profile may have been removed or is not available."
          action={
            <Button asChild className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
              <Link to="/search">Browse inventory</Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto my-10 min-h-[80vh] max-w-7xl px-4 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4 -ml-3 h-9 rounded-md text-slate-600">
        <Link to="/search">
          <ArrowLeft className="size-4" />
          Back to inventory
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                src={profile.imageUrl || defaultUserImage}
                alt={profile.name}
                className="size-24 rounded-full border-4 border-white/15 bg-white object-cover"
              />
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  <ShieldCheck className="size-4 text-emerald-300" />
                  {roleLabel(profile.role)}
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{profile.name}</h1>
                {profile.dealerName ? <p className="mt-1 text-sm font-medium text-slate-300">{profile.dealerName}</p> : null}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {canMessageProfile && !isOwnProfile ? (
                <Button
                  type="button"
                  onClick={messageSeller}
                  disabled={openDirectConversation.isPending}
                  className="rounded-md bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-60"
                >
                  {openDirectConversation.isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
                  {openDirectConversation.isPending ? "Opening chat..." : "Message seller"}
                </Button>
              ) : null}
              <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <p className="text-slate-300">Active listings</p>
                <p className="mt-1 text-2xl font-bold text-white">{profile.listingCount ?? cars.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4 lg:p-8">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Phone className="size-4" />
              Phone
            </p>
            <p className="mt-2 break-words text-sm font-bold text-slate-950">{profile.phone || "Not provided"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Mail className="size-4" />
              Email
            </p>
            <p className="mt-2 break-words text-sm font-bold text-slate-950">{profile.email}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <MapPin className="size-4" />
              Location
            </p>
            <p className="mt-2 break-words text-sm font-bold text-slate-950">{profile.location || "Not provided"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Store className="size-4" />
              Account type
            </p>
            <p className="mt-2 text-sm font-bold text-slate-950">{roleLabel(profile.role)}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Seller inventory</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Listings by {profile.name}</h2>
          </div>
        </div>

        {cars.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarItem key={String(car.id)} car={car} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CarFront className="size-5" />}
            title="No active listings"
            description="This profile does not have any published vehicles right now."
          />
        )}
      </section>
    </main>
  );
};

export default PublicProfile;
