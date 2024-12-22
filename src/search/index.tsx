import React from "react";
import { useSearchParams } from "react-router-dom";
import { useGetCarsByOptions } from "../utils/mutation";
import Search from "../components/Search";
import { carListing } from "../utils/types";
import CarItem from "../components/CarItem";
import { IoCarSport } from "react-icons/io5";

const SearchByOptions = () => {
  const [searchParams] = useSearchParams();
  const condition = searchParams.get("cars");
  const make = searchParams.get("make");
  const sellingPrice = searchParams.get("price");
  const { data, isPending } = useGetCarsByOptions({
    condition,
    make,
    sellingPrice,
  });
  console.log(data);

  return (
    <div>
      <div className="py-5 md:p-10 bg-black flex justify-center">
        <Search />
      </div>
      <div className="px-6 py-10 md:px-20 ">
        <div>
          <h2 className="font-bold text-2xl md:text-4xl pb-5">Search Result</h2>
        </div>

        {isPending ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(4)
              .fill("car")
              .map((_, i) => (
                <div
                  key={i}
                  className="h-[330px] rounded-xl bg-slate-200 animate-pulse"
                ></div>
              ))}
          </div>
        ) : (
          <div>
            {data?.cars?.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {data?.cars.map((car: carListing, i: number) => (
                  <div key={i}>
                    <CarItem car={car} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[10rem] flex flex-col justify-center items-center text-gray-400">
                <IoCarSport className="text-2xl" />
                <p className="text-lg">No car available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchByOptions;
