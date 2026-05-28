import Carousel from './Carousel';

const fallbackImage =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=85';

const ImageGallery = ({ images, loading }: { images: string[]; loading: boolean }) => {
  const galleryImages = images?.length ? images : [fallbackImage];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {loading ? (
        <div className="h-72 w-full animate-pulse bg-slate-200 sm:h-[32rem]" />
      ) : galleryImages.length > 1 ? (
        <Carousel images={galleryImages} />
      ) : (
        <img
          src={galleryImages[0]}
          className="h-72 w-full object-cover sm:h-[32rem]"
          alt="Vehicle listing"
        />
      )}
    </div>
  );
};

export default ImageGallery;
