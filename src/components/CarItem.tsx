
import { Separator } from "./ui/separator";
import { LuFuel } from "react-icons/lu";
import { RiSpeedUpLine } from "react-icons/ri";
import { GiGearStickPattern } from "react-icons/gi";
import { carListing } from "../utils/types";
import {formatCurrency} from '../lib/utils'
import { Link } from "react-router-dom";


const CarItem = ({ car }: { car: carListing }) => {
console.log(car);

  return (
  <Link to={`/listing-details/${car?.id}`}>
    <div className="rounded-xl bg-white border shadow-md cursor-pointer">
    <span className={`${car?.condition=='New'?'bg-green-500':car?.condition=='Used'?'bg-orange-500':'bg-purple-400'} absolute m-2 px-2 rounded-full text-sm pb-0.5 text-white`}>{car?.condition}</span>
      <img src={car?.carImages&&car?.carImages[0]} className="rounded-t-xl h-[180px] object-cover" width='100%' height={250} />
      <div className="px-4">
        <h2 className="font-bold text-black text-lg mb-2">{car?.listingTitle}</h2>
        <Separator className=" bg-gray-200" />

        <div className="grid grid-cols-3 mt-5">
          <div className="flex flex-col items-center">
            <RiSpeedUpLine className="text-lg mb-2" />
            <h2>{`${(car?.mileage)?.substring(0,3)}...`} Miles</h2>
          </div>
          <div className="flex flex-col items-center">
            <LuFuel className="text-lg mb-2" />
            <h2>{car?.fuelType}</h2>
          </div>
          <div className="flex flex-col items-center">
            <GiGearStickPattern className="text-lg mb-2" />
            <h2>{car?.transmission}</h2>
          </div>
        </div>

           <Separator className=" bg-gray-200 my-2" />

           <h2 className="font-bold md:text-xl my-4">{formatCurrency(car?.sellingPrice)}</h2>
      </div>
    </div>
  </Link> 
  );
};

export default CarItem;
