import { carList } from './shared/FakeData';
import CarItem from './CarItem';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import { useGetPopularCars  } from '../utils/mutation';
import { carListing } from '../utils/types';
import { IoCarSport } from "react-icons/io5";


const MostSearchedCars = () => {
console.log(carList);
  const { data } = useGetPopularCars ();

  return (
    <div className='mx-16 md:mx-24'>
    <h2 className='font-bold text-2xl md:text-3xl text-center mt-16 mb-7'>Most Searched Cars</h2>
{data?.cars.length>0?
    <Carousel>
  <CarouselContent>
    {data?.cars.map((car:carListing,i:number)=>
(
    <CarouselItem key={i} className='md:basis-1/4'><CarItem car={car}/></CarouselItem>

))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>:
  <div className='h-[10rem] flex flex-col justify-center items-center text-gray-400'>
      <IoCarSport className='text-2xl' />
      <p className='text-lg'>No car avilable</p>
      </div>
}
    </div>
  )
}

export default MostSearchedCars