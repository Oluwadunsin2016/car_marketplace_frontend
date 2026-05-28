
import DetailHeader from '../components/DetailHeader';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGetParticularCar } from '@/shared/api/hooks';
import ImageGallery from '../components/ImageGallery';
import Description from '../components/Description';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Specification from '../components/Specification';
import OwnerDetails from '../components/OwnerDetails';
import FinancialCalculator from '../components/FinancialCalculator';
import MostSearchedCars from '@/shared/components/marketing/MostSearchedCars';
import { ErrorState } from '@/shared/ui/state';

const ListingDetails = () => {
  const { id } = useParams();
  const previousId = useRef<string | undefined>(undefined);
  const { data, isPending, isError, refetch } = useGetParticularCar(id || '');
  const isSold = data?.car?.status === 'sold';

  useEffect(() => {
    if (previousId.current && previousId.current !== id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    previousId.current = id;
  }, [id]);

  return (
    <div className="bg-[#f7f8fb]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isError ? (
          <ErrorState
            title="Listing could not be loaded"
            description="This car listing may be unavailable, or the marketplace could not be reached."
            onRetry={() => refetch()}
            className="min-h-[28rem]"
          />
        ) : (
          <>
            <DetailHeader loading={isPending} car={data?.car} />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="flex min-w-0 flex-col gap-6">
                <ImageGallery loading={isPending} images={data?.car?.carImages || []} />
                <Description loading={isPending} car={data?.car} />
                <Specification loading={isPending} car={data?.car} />
                <Features loading={isPending} features={data?.car?.features || {}} />
                <FinancialCalculator loading={isPending} car={data?.car} />
              </div>

              <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
                <Pricing loading={isPending} car={data?.car} />
                <OwnerDetails loading={isPending} title={data?.car?.listingTitle || ''} creator={data?.car?.creator} unavailable={isSold} />
              </aside>
            </div>
          </>
        )}
      </div>

      <MostSearchedCars />
    </div>
  );
};

export default ListingDetails;
