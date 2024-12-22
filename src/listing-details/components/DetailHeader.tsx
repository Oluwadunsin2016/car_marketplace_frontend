
import { carListing } from "../../utils/types";
import { HiCalendarDays } from "react-icons/hi2";
import { BsSpeedometer2 } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaGasPump } from "react-icons/fa";

const DetailHeader = ({ car,loading }: { car: carListing,loading:boolean }) => {
  return (
  <div>
  {loading?
  <div className="">
   <h2 className="rounded-xl h-8 mb-2 w-[12rem] bg-slate-200 animate-pulse"></h2>
   <p className="rounded-xl h-5 mb-4 w-[6rem] bg-slate-200 animate-pulse"></p>
<div className="flex items-center gap-2 my-2 flex-wrap">
<p className="rounded-xl h-6 w-[6rem] bg-slate-200 animate-pulse"></p>
<p className="rounded-xl h-6 w-[6rem] bg-slate-200 animate-pulse"></p>
<p className="rounded-xl h-6 w-[6rem] bg-slate-200 animate-pulse"></p>
<p className="rounded-xl h-6 w-[6rem] bg-slate-200 animate-pulse"></p>
</div>
  </div>
  :
    <div>
      <h2 className="font-bold text-xl md:text-3xl">{car?.listingTitle}</h2>

      <p className="text-sm">{car?.tagLine}</p>

      <div className="flex items-center gap-2 my-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-full bg-blue-50 py-1 px-3 text-primary">
          <HiCalendarDays size={16} />
          <p className="text-sm">{car?.year}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-blue-50 py-1 px-3 text-primary">
          <BsSpeedometer2 size={16} />
          <p className="text-sm">{car?.mileage}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-blue-50 py-1 px-3 text-primary">
          <GiGearStickPattern size={16} />
          <p className="text-sm">{car?.transmission}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-blue-50 py-1 px-3 text-primary">
          <FaGasPump size={16} />
          <p className="text-sm">{car?.fuelType}</p>
        </div>
      </div>
    </div>
  }
  </div>
  );
};

export default DetailHeader;
