import { UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { Button } from '@/shared/ui/button';
import { Link, NavLink } from 'react-router-dom';
import { Mail, Menu, Plus, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetConversations, useSyncCurrentUser } from '@/shared/api/hooks';

type SocketLike = {
  emit: (event: string, payload?: unknown) => void;
  on: <Payload = unknown>(event: string, callback: (payload: Payload) => void) => void;
  off: <Payload = unknown>(event: string, callback?: (payload: Payload) => void) => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    io?: (url: string, options: { auth: { token: string | null }; transports?: string[] }) => SocketLike;
  }
}

const getSocketUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/';
  return apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const loadSocketClient = () =>
  new Promise<void>((resolve, reject) => {
    if (window.io) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-socket-io-client="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load chat socket')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `${getSocketUrl()}/socket.io/socket.io.js`;
    script.async = true;
    script.dataset.socketIoClient = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load chat socket'));
    document.body.appendChild(script);
  });

const Header = () => {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: conversationsData } = useGetConversations(Boolean(isSignedIn));
  const { data: profileData } = useSyncCurrentUser(Boolean(isSignedIn));
  const marketplaceRole = profileData?.user?.role;
  const canSell = marketplaceRole === 'seller' || marketplaceRole === 'dealer';
  const unreadMessageCount = useMemo(
    () => (conversationsData?.conversations || []).reduce((total, conversation) => total + (conversation.unreadCount || 0), 0),
    [conversationsData?.conversations]
  );

  const navLinks = [
    { label: 'Home', link: '/' },
    { label: 'Inventory', link: '/search' },
    { label: 'New', link: '/search?cars=New' },
    { label: 'Used', link: '/search?cars=Used' },
  ];

  useEffect(() => {
    if (!isSignedIn) return;

    let socket: SocketLike | null = null;
    let cancelled = false;

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        await loadSocketClient();
        if (cancelled || !window.io) return;

        socket = window.io(getSocketUrl(), { auth: { token }, transports: ['websocket', 'polling'] });
        const refreshMessages = () => queryClient.invalidateQueries({ queryKey: ['chatConversations'] });

        socket.on('message:new', refreshMessages);
        socket.on('conversation:updated', refreshMessages);
        socket.on('message:read', refreshMessages);
      } catch (error) {
        console.error('Unable to connect message notification socket:', error);
      }
    };

    connectSocket();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [getToken, isSignedIn, queryClient]);

  const MessageButton = ({ onClick }: { onClick?: () => void }) => (
    <Link
      to="/message"
      onClick={onClick}
      aria-label="Messages"
      className="relative inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
    >
      <Mail className="size-5" />
      {unreadMessageCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
          {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
        </span>
      ) : null}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-slate-950">
            <img src="/logo.svg" alt="Triumphant Cars" className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-950 md:text-lg">
              Triumphant Cars
            </span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              Verified marketplace
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((navLink) => (
            <NavLink
              key={navLink.label}
              to={navLink.link}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`
              }
            >
              {navLink.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" className="border-slate-300 bg-white">
            <Link to="/search">
              <Search className="size-4" />
              Browse
            </Link>
          </Button>
          {isSignedIn ? (
            <>
              <MessageButton />
              {canSell ? (
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link to="/add-listing">
                    <Plus className="size-4" />
                    Sell a car
                  </Link>
                </Button>
              ) : null}
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Marketplace profile"
                    labelIcon={<UserRound className="size-4" />}
                    href="/profile"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link to="/sign-in">
                <UserRound className="size-4" />
                Sign in
              </Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="relative inline-flex size-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
        >
          <Menu
            className={`absolute size-5 transition duration-200 ${
              isMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <X
            className={`absolute size-5 transition duration-200 ${
              isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
            }`}
          />
        </button>
      </div>

      <div
        className={`absolute left-0 top-full z-40 w-full border-t border-slate-200 bg-white px-4 py-4 shadow-xl shadow-slate-900/10 transition-all duration-200 md:hidden ${
          isMenuOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <nav className="grid gap-1">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.label}
                to={navLink.link}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {navLink.label}
              </Link>
            ))}
            {isSignedIn ? (
              <>
                <Link
                  to="/message"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Messages</span>
                  {unreadMessageCount > 0 ? (
                    <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  ) : null}
                </Link>
                {canSell ? (
                  <Link
                    to="/add-listing"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sell a car
                  </Link>
                ) : null}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My listings
                </Link>
              </>
            ) : (
              <Button asChild className="mt-2 w-full bg-slate-950 text-white hover:bg-slate-800">
                <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
