import { IoMdCloseCircle } from "react-icons/io";

type uploadProps={
selectedFileList:File[];
carImages:string[];
deleteOldImageFromFirebase:(url:string)=>void;
setSelectedFileList:React.Dispatch<React.SetStateAction<File[]>>
}
const UploadImages = ({selectedFileList,setSelectedFileList,carImages,deleteOldImageFromFirebase}:uploadProps) => {
  
  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setSelectedFileList((prev: File[]) => [...prev, file]);
    }
  };

const removeImage=(image:File)=>{
const result = selectedFileList.filter(currentImage=>currentImage!==image)
setSelectedFileList(result)
}
  return (
    <div>
      <h2 className="font-medium text-xl my-3">Upload Car Images</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
       {carImages&&carImages?.map((image, i) => (
          <div key={i} className='relative'>
          <IoMdCloseCircle onClick={()=>deleteOldImageFromFirebase(image)} className="absolute top-1 right-1 text-red-500 cursor-pointer"/>
            <img
              src={image}
              alt=""
              className="w-full h-[100px] md:h-[130px] object-cover rounded-xl"
            />
          </div>
        ))}
        {selectedFileList.map((image, i) => (
          <div key={i} className="relative">
          <IoMdCloseCircle onClick={()=>removeImage(image)} className="absolute top-1 right-1 text-red-500 cursor-pointer"/>
            <img
              src={URL.createObjectURL(image)}
              alt=""
              className="w-full h-[100px] md:h-[130px] object-cover rounded-xl"
            />
          </div>
        ))}
        <label htmlFor="upload-images">
          <div className="border rounded-xl border-dotted border-primary bg-blue-100 p-4 cursor-pointer text-primary hover:shadow-md h-[100px] md:h-[130px] flex justify-center items-center">
            <h2 className="text-lg">+</h2>
          </div>
        </label>
        <input
          type="file"
          multiple={true}
          id="upload-images"
          className="hidden"
          onChange={onFileSelected}
        />
       
      </div>
      </div>
  );
};

export default UploadImages;
