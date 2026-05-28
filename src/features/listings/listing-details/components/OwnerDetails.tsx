import { user } from '@/shared/types/marketplace';
import { useOpenDirectConversation } from '@/shared/api/hooks';
import { notifier } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { useUser } from '@clerk/clerk-react';
import { Loader2, Mail, MessageCircle, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const defaultUserImage = '/assets/images/default_user_image.png';

const getProfileId = (creator?: user) => {
  const candidates = [creator?.appUserId, creator?.id, creator?.email];
  const match = candidates.find((value) => {
    if (value === undefined || value === null) return false;
    const normalized = String(value).trim();
    return normalized && normalized !== 'undefined' && normalized !== 'null' && normalized !== '[object Object]';
  });

  return match ? encodeURIComponent(String(match)) : '';
};

const OwnerDetails = ({
  creator,
  loading,
  unavailable,
}: {
  creator?: user;
  loading: boolean;
  title: string;
  unavailable?: boolean;
}) => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const openDirectConversation = useOpenDirectConversation();
  const profileId = getProfileId(creator);
  const isOwnListing = user?.primaryEmailAddress?.emailAddress === creator?.email;
  
  const messageOwner = async () => {
    if (unavailable) return;
    if (!creator) return;

    const recipientId = profileId;

    if (!isSignedIn) {
      navigate(`/message?recipientId=${recipientId}`);
      return;
    }

    try {
      const data = await openDirectConversation.mutateAsync({
        creator: {
          id: creator.id,
          appUserId: creator.appUserId,
          name: creator.name,
          email: creator.email,
          imageUrl: creator.imageUrl,
        },
      });
      navigate(`/message?conversationId=${data.conversation._id}`);
    } catch (error) {
      notifier({ message: 'Unable to open this conversation', type: 'error' });
    }
  };

  return (
    <div id="seller-contact">
      {loading ? (
        <div className="h-64 w-full animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Seller
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Owner details</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="size-4" />
              Verified
            </span>
          </div>

          <div className="flex gap-4">
            <img
              src={creator?.imageUrl || defaultUserImage}
              alt={creator?.name || 'Seller'}
              className="size-16 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">{creator?.name || 'Seller'}</h3>
              <p className="mt-1 flex min-w-0 items-center gap-1 text-sm text-slate-500">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{creator?.email || 'Email not available'}</span>
              </p>
              <p className="mt-1 flex min-w-0 items-center gap-1 text-sm text-slate-500">
                <Phone className="size-4 shrink-0" />
                <span className="truncate">{creator?.phone || 'Phone not available'}</span>
              </p>
            </div>
          </div>

          {profileId ? (
            <Button asChild variant="outline" size="lg" className="mt-6 w-full rounded-md border-slate-300 bg-white">
              <Link to={`/profile/${profileId}`}>
                <UserRound className="size-4" />
                View seller profile
              </Link>
            </Button>
          ) : null}

          {!isOwnListing ? (
            <Button
              disabled={unavailable || openDirectConversation.isPending}
              size="lg"
              onClick={messageOwner}
              className="mt-3 w-full rounded-md bg-slate-950 text-white hover:bg-slate-800"
            >
              {openDirectConversation.isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
              {unavailable ? 'Sold out' : openDirectConversation.isPending ? 'Opening chat...' : 'Message seller'}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default OwnerDetails;
