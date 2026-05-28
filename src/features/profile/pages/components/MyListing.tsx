import { MouseEvent, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useDeleteParticularCar, useGetUserCars, useSyncCurrentUser, useUpdateCar } from "@/shared/api/hooks";
import { carListing } from "@/shared/types/marketplace";
import { formatCurrency, notifier } from "@/shared/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { AlertTriangle, BadgeCheck, CarFront, CheckCircle2, Edit3, Fuel, Gauge, LockKeyhole, MapPin, MoreVertical, Plus, RefreshCcw, Search, Settings, ShoppingBag, Trash2 } from "lucide-react";
import { CarGridSkeleton, EmptyState, ErrorState, PanelSkeleton } from "@/shared/ui/state";

const getCarId = (car: carListing) => String(car.id || car._id || "");

const MyListing = () => {
  const [deleteTarget, setDeleteTarget] = useState<carListing | null>(null);
  const [openMenuId, setOpenMenuId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const { mutateAsync: deleteCar, isPending: isDeleting } = useDeleteParticularCar();
  const updateCar = useUpdateCar();
  const { data, isPending, isError, refetch } = useGetUserCars(email);
  const { data: profileData, isLoading: isProfileLoading } = useSyncCurrentUser();
  const marketplaceRole = profileData?.user?.role;
  const canSell = marketplaceRole === "seller" || marketplaceRole === "dealer";

  const cars = data?.cars || [];
  const activeListings = cars.filter((car: carListing) => (car.status || "active") === "active").length;
  const soldListings = cars.filter((car: carListing) => car.status === "sold").length;
  const filteredCars = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return cars;

    return cars.filter((car: carListing) =>
      [car.listingTitle, car.make, car.model, car.year, car.condition, car.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [cars, searchTerm]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCar({ id: getCarId(deleteTarget), email });
    setDeleteTarget(null);
  };

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>, carId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenuId((current) => (current === carId ? "" : carId));
  };

  const updateListingStatus = async (car: carListing, status: "active" | "sold") => {
    const carId = getCarId(car);
    if (!carId) return;

    const payload = new FormData();
    payload.append("id", String(carId));
    payload.append("status", status);

    try {
      await updateCar.mutateAsync(payload);
      notifier({
        message: status === "sold" ? "Listing marked as sold." : "Listing reactivated.",
        type: "success",
      });
    } catch (error) {
      notifier({ message: "Unable to update listing status.", type: "error" });
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Seller inventory</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">My listings</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage active vehicles, update listing details, and keep your showroom accurate.
            </p>
          </div>
          {canSell ? (
            <Button asChild className="h-11 rounded-md bg-slate-950 px-4 text-white hover:bg-slate-800">
              <Link to="/add-listing">
                <Plus className="size-4" />
                Add listing
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <CarFront className="size-4" />
              Total listings
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{cars.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <BadgeCheck className="size-4" />
              Active
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{activeListings}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShoppingBag className="size-4" />
              Sold
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{soldListings}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 md:max-w-md">
          <Search className="size-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search your listings"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>
        <p className="text-sm font-medium text-slate-500">
          Showing {filteredCars.length} of {cars.length}
        </p>
      </div>

      {isProfileLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <PanelSkeleton />
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
      ) : !canSell ? (
        <EmptyState
          icon={<LockKeyhole className="size-5" />}
          title="Selling is available to sellers and dealers"
          description="Buyer accounts can browse inventory and message sellers. To publish vehicles, update your marketplace profile to a seller or dealer account."
          action={
            <Button asChild className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
              <Link to="/profile">Edit profile details</Link>
            </Button>
          }
        />
      ) : isPending ? (
        <CarGridSkeleton count={6} className="xl:grid-cols-3" />
      ) : isError ? (
        <ErrorState
          title="Your listings could not be loaded"
          description="We could not retrieve your seller inventory. Try again before making listing changes."
          onRetry={() => refetch()}
        />
      ) : filteredCars.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCars.map((car: carListing) => (
            <div key={String(getCarId(car))} className="group relative h-full overflow-visible rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/80">
              <Link to={`/listing-details/${getCarId(car)}`} className="block overflow-hidden rounded-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={car.carImages?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80"}
                    alt={car.listingTitle}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {car.condition}
                  </span>
                  <span className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-bold shadow-sm ${(car.status || "active") === "sold" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                    {(car.status || "active") === "sold" ? "Sold out" : "Available"}
                  </span>
                </div>
                <div className="p-4">
                  <div>
                    <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">{car.listingTitle}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="size-3.5" />
                      {car.make} {car.model}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs text-slate-600">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Gauge className="size-4 text-slate-400" />
                      <span className="truncate">{Number(car.mileage || 0).toLocaleString()} mi</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Fuel className="size-4 text-slate-400" />
                      <span className="truncate">{car.fuelType}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Settings className="size-4 text-slate-400" />
                      <span className="truncate">{car.transmission}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Price</p>
                      <p className="text-lg font-bold text-slate-950">{formatCurrency(car.sellingPrice)}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">View details</span>
                  </div>
                </div>
              </Link>
              <div className="absolute right-3 top-3 z-20">
                <button
                  type="button"
                  onClick={(event) => toggleMenu(event, getCarId(car))}
                  aria-label={`Open actions for ${car.listingTitle}`}
                  className="grid size-9 place-items-center rounded-full border border-white/70 bg-white/95 text-slate-700 shadow-sm transition hover:scale-105 hover:text-slate-950"
                >
                  <MoreVertical className="size-4" />
                </button>
                  <div
                    className={`absolute right-0 top-11 w-48 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm font-semibold text-slate-700 shadow-xl shadow-slate-900/10 transition-all duration-200 ${
                      openMenuId === getCarId(car)
                        ? "translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                    }`}
                  >
                    <Link
                      to={`/add-listing?mode=edit&id=${getCarId(car)}`}
                      onClick={() => setOpenMenuId("")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId("");
                        updateListingStatus(car, (car.status || "active") === "sold" ? "active" : "sold");
                      }}
                      disabled={updateCar.isPending}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      {(car.status || "active") === "sold" ? <RefreshCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
                      {(car.status || "active") === "sold" ? "Reactivate" : "Mark as sold"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId("");
                        setDeleteTarget(car);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CarFront className="size-5" />}
          title="No listings found"
          description={searchTerm ? "Try another search term or clear your search." : "Create your first listing and start receiving buyer messages."}
          action={!searchTerm && canSell ? (
            <Button asChild className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
              <Link to="/add-listing">
                <Plus className="size-4" />
                Add listing
              </Link>
            </Button>
          ) : null}
        />
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-lg border border-slate-200 bg-white sm:max-w-md">
          <AlertDialogHeader>
            <span className="mb-2 grid size-11 place-items-center rounded-md bg-red-50 text-red-600">
              <AlertTriangle className="size-5" />
            </span>
            <AlertDialogTitle>Delete this car listing?</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              You are about to permanently delete <strong className="font-semibold text-slate-950">{deleteTarget?.listingTitle || "this listing"}</strong>.
              The listing and its uploaded images will be removed, and buyers will no longer be able to view or message you from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            This action cannot be undone.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md" disabled={isDeleting}>Keep listing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-md bg-red-600 text-white hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting listing..." : "Yes, delete listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default MyListing;
