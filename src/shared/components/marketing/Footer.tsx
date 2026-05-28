import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useSyncCurrentUser } from "@/shared/api/hooks";

const Footer = () => {
  const { isSignedIn } = useUser();
  const { data: profileData } = useSyncCurrentUser(Boolean(isSignedIn));
  const marketplaceRole = profileData?.user?.role;
  const canSell = !isSignedIn || marketplaceRole === "seller" || marketplaceRole === "dealer";

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-lg font-bold">Triumphant Cars</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            A focused car marketplace for verified listings, clear specs, and direct seller conversations.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
          <Link to="/search" className="hover:text-white">
            Inventory
          </Link>
          {canSell ? (
            <Link to="/add-listing" className="hover:text-white">
              Sell
            </Link>
          ) : null}
          <a href="mailto:hello@triumphantcars.com" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
