import React,{useState} from "react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGetUserCars,useDeleteParticularCar } from "../../utils/mutation";
import CarItem from "../../components/CarItem";
import { FaTrashAlt } from "react-icons/fa";
import { carListing } from "../../utils/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../../config/firebaseConfig";
import { IoCarSport } from "react-icons/io5";



const MyListing = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const {mutateAsync:deleteCar,isPending:isDeleting}=useDeleteParticularCar()
  const { data,isPending } = useGetUserCars(
    user?.primaryEmailAddress?.emailAddress || ""
  );
console.log(data)
   const handleDelete = async (car:carListing) => {
    await deleteCar({ id: car?.id, email: user?.primaryEmailAddress?.emailAddress || "" });
    if(car?.carImages) await deleteOldImagesFromFirebase(car?.carImages);
    setIsOpen(false)
  };

const deleteOldImagesFromFirebase = async (imageUrls: string[]) => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      // Extract the file path from the URL
      const decodedUrl = decodeURIComponent(url);
      const pathStart = decodedUrl.indexOf('car-marketplace/');
      const pathEnd = decodedUrl.indexOf('?'); // Find where the query parameters start
      const filePath = pathEnd > -1 ? decodedUrl.substring(pathStart, pathEnd) : decodedUrl.substring(pathStart);

      // Create a storage reference
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef); // Delete the file from Firebase
      console.log(`Deleted: ${filePath}`);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  });

  await Promise.all(deletePromises); // Wait for all deletions to complete
};

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl">
          My Listing
        </h2>
        <Link to="/add-listing">
          <Button className="bg-primary text-white rounded">
            + Add New Listing
          </Button>
        </Link>
      </div>

      {isPending? <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array(4).fill('car').map((_,i)=>(
    <div key={i} className='h-[330px] rounded-xl bg-slate-200 animate-pulse'></div>
    ))}
    </div>:
      <div>
{
data?.cars?.length>0?
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7">
      {data?.cars.map((car:carListing,i:number)=>(
      <div key={i}>
      <CarItem car={car}/> 
      <div className='bg-gray-50 rounded-lg flex justify-between gap-4 p-2'>
      <Link to={`/add-listing?mode=edit&id=${car?.id}`} className='w-full'>
      <Button variant='outline' className='w-full border-blue-500 rounded'>Edit</Button>
      </Link>
      <Button variant='destructive' onClick={()=>setIsOpen(true)} className='bg-red-500 rounded text-white' >
      <FaTrashAlt />
      </Button>
      </div>
      <AlertDialog open={isOpen} onOpenChange={()=>handleDelete(car)}>
  <AlertDialogContent className='bg-white border-none rounded-md' >
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure you want to delete this car?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete this car
        and its related information.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className='rounded ' onClick={()=>setIsOpen(false)} >Cancel</AlertDialogCancel>
      <AlertDialogAction className='rounded text-white bg-red-600' >{isDeleting?"Deleting...":"Delete"}</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
      </div>
      ))}
      </div>:
      <div className='h-[10rem] flex flex-col justify-center items-center text-gray-400'>
      <IoCarSport className='text-2xl' />
      <p className='text-lg'>No car available</p>
      </div>
}
      </div>
      }

    </div>
  );
};

export default MyListing;
