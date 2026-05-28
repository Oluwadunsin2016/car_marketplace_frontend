
import Header from '@/shared/components/marketing/Header';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '@/shared/components/marketing/Footer';
import { Toaster } from 'react-hot-toast';
import AuthProfileGate from '@/app/routes/AuthProfileGate';
import { OfflineBanner } from '@/shared/ui/state';

const Layout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/message';

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <Header />
      <OfflineBanner />
      <AuthProfileGate />
      <main className="min-h-[92vh]">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Layout;
