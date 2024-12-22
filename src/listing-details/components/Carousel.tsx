// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import '../../index.css';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

export default function Carousel({ images }: { images: string[] }) {
  return (
    <div className='h-full relative'>
       <div className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2 cursor-pointer rounded-full bg-blue-500/30 hover:bg-blue-500/75 p-0.5 md:p-2" id="custom-prev">
        <IoChevronBackOutline className='text-xl text-slate-200' />
      </div>
      <div className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2 cursor-pointer rounded-full bg-blue-500/30 hover:bg-blue-500/75 p-0.5 md:p-2" id="custom-next">
        <IoChevronForwardOutline className='text-xl text-slate-200' />
      </div>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        navigation={{
          prevEl: '#custom-prev',
          nextEl: '#custom-next',
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper rounded-xl"
      >
        {images?.map((item,i)=>(
        <SwiperSlide key={i} className='mySwiper-slide'><img src={item} alt="" /></SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

