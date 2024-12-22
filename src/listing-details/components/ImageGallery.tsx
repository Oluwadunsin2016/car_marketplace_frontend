import React from "react";
import Carousel from "./Carousel"; 
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "../../components/ui/carousel"

const ImageGallery = ({ images,loading }: { images: string[],loading:boolean }) => {
  return (
    <div>
      {loading? <div className="w-full h-48 sm:h-64 md:h-[30rem] rounded-xl bg-slate-200 animate-pulse"></div>:images?.length > 1 ? (
        <Carousel images={images} />
      ) : (
        <img
          src={images[0]}
          className="w-full h-48 sm:h-64 md:h-[30rem] object-cover rounded-xl"
          alt=""
        />
      )}
       {/* {loading? <div className="w-full h-48 sm:h-64 md:h-[30rem] rounded-xl bg-slate-200 animate-pulse"></div>:<img
          src={images&&images[0]}
          className="w-full h-48 sm:h-64 md:h-[30rem] object-cover rounded-xl"
          alt=""
        />} */}
    </div>
  );
};

export default ImageGallery;
