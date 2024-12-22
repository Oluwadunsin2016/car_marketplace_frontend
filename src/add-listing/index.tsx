import React, { useState,useEffect } from 'react'
import data from '../components/shared/carDetails.json'
import features from '../components/shared/features.json'
import InputField from './components/InputField'
import DropdownField from './components/DropdownField'
import TextAreaField from './components/TextAreaField'
import { Separator } from '../components/ui/separator'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { useCreateCar,useGetParticularCar,useUpdateCar } from '../utils/mutation'
import IconField from './components/IconField'
import UploadImages from './components/UploadImages'
import {deleteObject, getDownloadURL, ref, uploadBytes} from 'firebase/storage'
import {storage} from '../../config/firebaseConfig'
import { carListing } from '../utils/types'
import { LuLoader2 } from 'react-icons/lu'
import { toast } from 'sonner'
import { useNavigate, useSearchParams, } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AddListing = () => {
const [formData, setFormData] = useState<Record<string, string|number>>(Object.fromEntries(data.carDetails.map(carDetail=> [carDetail?.name, ''])))
const [selectedFileList, setSelectedFileList] = useState<File[]>([]);
const [isLoading, setIsLoading] = useState(false)
const [carImages, setCarImages] = useState<string[]>([]);
const [dataError, setDataError] = useState<Record<string, boolean>>(
  Object.fromEntries(
    data.carDetails?.map(mappedItem => {
      if (mappedItem?.required) {
        return [mappedItem?.name, false];
      }
      return null; // Explicitly return null for non-required items
    }).filter(Boolean) as [string, boolean][] // Remove any null or undefined entries
  ) || {}
);
const {user}=useUser()
const navigate=useNavigate()
const [searchParams]=useSearchParams()
const [featureData, setFeatureData] = useState<Record<string, boolean>>({})
const {mutateAsync:createCar}=useCreateCar()
const {mutateAsync:updateCar}=useUpdateCar()

const mode =searchParams.get('mode')
const recordId =searchParams.get('id')
const {data:car}=useGetParticularCar(recordId||'')

console.log(dataError);

useEffect(()=>{
if(mode=='edit'){
setFeatureData(car?.car?.features)
setCarImages(car?.car?.carImages)
}
},[car,mode])

const handleInputChange=(name: string, value: string | number)=>{
setFormData(prevData=>({...prevData,[name]:value}))
console.log(formData);
}


const handleFeatureChange=(name:string,isChecked: boolean)=>{
  setFeatureData((prev) => ({
      ...prev,
      [name]: isChecked,
    }));
console.log(featureData);
}


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
console.log(dataError);

  // Create a copy of errors to update
  const updatedErrors: Record<string, boolean> = { ...dataError };
  let hasError = false;
console.log(formData);

  // Validate formData
  for (const key of Object.keys(dataError)) {
    if (formData[key] == '') {
      updatedErrors[key] = true; // Mark field as invalid
      hasError = true;
    } else {
      updatedErrors[key] = false;
    }
  }

  // Update the error state
  setDataError(updatedErrors);

  // If there are errors, stop the submission
  if (hasError) {
    toast.error('Please fill all the required fields');
    return;
  }else if (selectedFileList.length<1) {
    toast.error('You must select atleast one image');
    return
  }

  // Proceed with submission if no errors
  toast('Please wait...');
  try {
    setIsLoading(true);

    // Example: Upload images
    const urls = await uploadImagesToServer();

    // Create payload
    const payload: carListing = {
      ...formData,
      features: featureData,
      carImages: urls,
      creator: {
        id: user?.id,
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        imageUrl: user?.imageUrl,
      },
    } as carListing;

    // Submit the form
    await createCar(payload);
    setIsLoading(false);
    navigate('/profile');
    console.log('Car listing created successfully!');
  } catch (error) {
    console.error('Error submitting the form:', error);
  }
};



const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  toast('Updating car listing...');
  try {
    setIsLoading(true);
     let updatedCarImages:string[] = carImages;
     if (selectedFileList?.length > 0) {
      const uploadedImages = await uploadImagesToServer();
       updatedCarImages = [...updatedCarImages, ...uploadedImages]
      setCarImages(updatedCarImages);
    }

    const payload: carListing = {
      ...formData,
      features: featureData,
      id: car?.car?.id,
      carImages:updatedCarImages,
    } as carListing;

    await updateCar(payload); // Call the update function
    setIsLoading(false);
    navigate('/profile');
    console.log('Car listing updated successfully!');
  } catch (error) {
    console.error('Error updating the car listing:', error);
    toast.error('Failed to update car listing');
  }
};



const uploadImagesToServer = async (): Promise<string[]> => {
  try {
    const imageUrls: string[] = await Promise.all(
      selectedFileList.map(async (file: File) => {
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `car-marketplace/${fileName}`);
        const metaData = { contentType: file.type || 'image/jpg' }; // Dynamically detect content type

        await uploadBytes(storageRef, file, metaData); // Wait for upload to complete
        const downloadUrl = await getDownloadURL(storageRef); // Get the download URL
        return downloadUrl;
      })
    );
    return imageUrls;
  } catch (error) {
    console.error('Error uploading images to Firebase:', error);
    return []; // Return an empty array in case of failure
  }
};


const deleteOldImageFromFirebase = async (imageUrl: string) => {
  setCarImages((prev) =>
    prev.filter((prevImg) => decodeURIComponent(prevImg) !== decodeURIComponent(imageUrl))
  );
    try {
      // Extract the file path from the URL
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathStart = decodedUrl.indexOf('car-marketplace/');
      const pathEnd = decodedUrl.indexOf('?'); // Find where the query parameters start
      const filePath = pathEnd > -1 ? decodedUrl.substring(pathStart, pathEnd) : decodedUrl.substring(pathStart);

      // Create a storage reference
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef); // Delete the file from Firebase
      console.log(`Deleted: ${filePath}`);
    } catch (error) {
      console.error('Error deleting old image:', error);
    };// Wait for all deletions to complete
};






  return (
    <div className='px-6 md:px-20 my-10'>
    <h2 className='font-bold text-2xl md:text-4xl'>{mode=='edit'?'Update Listing':'Add New Listing'}</h2>

    <form action="" onSubmit={mode=='edit'? handleUpdate : handleSubmit} className='p-6 md:p-10 mt-6 border rounded-xl'>
    {/* Car Details */}
<div>
<h2 className='font-medium text-xl mb-6'>Car Details</h2>
<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
{data.carDetails.map((item,i)=>(
<div key={i}>
<label className='text-sm flex items-center gap-2 mb-2'>
<IconField iconName={item?.icon}/>
{item?.label} {item?.required&& <span className='text-red-600'>*</span> }</label>
{item.fieldType=='text'||item.fieldType=='number'?<InputField item={item} handleInputChange={handleInputChange} carInfo={car?.car} dataError={dataError} />:item.fieldType=='dropdown'? <DropdownField carInfo={car?.car} item={item} formData={formData} handleInputChange={handleInputChange} setFormData={setFormData} dataError={dataError}  />:item.fieldType=='textarea'? <TextAreaField carInfo={car?.car} item={item} handleInputChange={handleInputChange}  dataError={dataError} />:null}
</div>
))}
</div>
</div>
 <Separator className=" bg-gray-200 my-6" />
    {/* Feature Listing */}
<h2 className='font-medium text-xl my-6'>Features</h2>
<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
{features?.features?.map((feature,i)=>(
<div key={i} className='flex gap-2 items-center'>
<Checkbox  onCheckedChange={(val: boolean) => handleFeatureChange(feature.name, val)}
  checked={featureData?.[feature.name]}className='rounded' />
<h2>{feature?.label}</h2>
</div>
))}
</div>
 <Separator className=" bg-gray-200 my-6" />
    {/* Car images */}
<UploadImages selectedFileList={selectedFileList} setSelectedFileList={setSelectedFileList} carImages={carImages} deleteOldImageFromFirebase={deleteOldImageFromFirebase} />
    <div className='mt-10 flex justify-end'>
    {mode=='edit'?
    <Button type='submit' disabled={isLoading} className='bg-primary text-white rounded'>{isLoading? <p className='flex items-center justify-center gap-1'><LuLoader2 className='animate-spin ttext-lg' /> Updating</p>:"Update"}</Button>:
    <Button type='submit' className='bg-primary text-white rounded'>{isLoading? <p className='flex items-center justify-center gap-1'><LuLoader2 className='animate-spin ttext-lg' /> Submitting</p>:"Submit"}</Button>
    }
    </div>
    </form>
    </div>
  )
}

export default AddListing