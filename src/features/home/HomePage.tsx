import Category from '@/shared/components/marketing/Category';
import Hero from '@/shared/components/marketing/Hero';
import InfoSection from '@/shared/components/marketing/InfoSection';
import MostSearchedCars from '@/shared/components/marketing/MostSearchedCars';

const Home = () => {
  return (
    <div>
      <Hero />
      <Category />
      <MostSearchedCars />
      <InfoSection />
    </div>
  );
};

export default Home;
