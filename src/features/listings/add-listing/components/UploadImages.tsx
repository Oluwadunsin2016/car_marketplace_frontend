import { ImagePlus, X } from "lucide-react";

type uploadProps = {
  selectedFileList: File[];
  carImages: string[];
  removeImageFromListing: (url: string) => void;
  setSelectedFileList: React.Dispatch<React.SetStateAction<File[]>>;
};

const UploadImages = ({ selectedFileList, setSelectedFileList, carImages = [], removeImageFromListing }: uploadProps) => {
  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFileList((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeImage = (image: File) => {
    setSelectedFileList((currentImages) => currentImages.filter((currentImage) => currentImage !== image));
  };

  const totalImages = carImages.length + selectedFileList.length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Media</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Vehicle photos</h2>
          <p className="mt-1 text-sm text-slate-500">Upload clear exterior, interior, dashboard, and detail photos.</p>
        </div>
        <span className="text-sm font-semibold text-slate-500">{totalImages} image{totalImages === 1 ? "" : "s"} selected</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {carImages.map((image) => (
          <div key={image} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <button
              type="button"
              onClick={() => removeImageFromListing(image)}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow transition hover:bg-red-600 hover:text-white"
              aria-label="Remove existing image"
            >
              <X className="size-4" />
            </button>
            <img src={image} alt="Vehicle" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
        ))}

        {selectedFileList.map((image) => (
          <div key={`${image.name}-${image.lastModified}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <button
              type="button"
              onClick={() => removeImage(image)}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow transition hover:bg-red-600 hover:text-white"
              aria-label="Remove selected image"
            >
              <X className="size-4" />
            </button>
            <img src={URL.createObjectURL(image)} alt={image.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
        ))}

        <label htmlFor="upload-images" className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-blue-300 bg-blue-50/70 p-4 text-center text-blue-700 transition hover:border-blue-500 hover:bg-blue-50">
          <ImagePlus className="mb-3 size-8" />
          <span className="text-sm font-bold">Add photos</span>
          <span className="mt-1 text-xs text-blue-700/70">PNG, JPG, WEBP</span>
        </label>
        <input
          type="file"
          multiple
          id="upload-images"
          className="hidden"
          accept="image/*"
          onChange={onFileSelected}
        />
      </div>
    </section>
  );
};

export default UploadImages;
