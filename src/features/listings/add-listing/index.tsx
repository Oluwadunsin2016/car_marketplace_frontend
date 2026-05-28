import { useState, useEffect } from "react";
import data from "@/shared/config/carDetails.json";
import features from "@/shared/config/features.json";
import InputField from "./components/InputField";
import DropdownField from "./components/DropdownField";
import TextAreaField from "./components/TextAreaField";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import {
  useCreateCar,
  useGetParticularCar,
  useSyncCurrentUser,
  useUpdateCar,
} from "@/shared/api/hooks";
import IconField from "./components/IconField";
import UploadImages from "./components/UploadImages";
import { LuLoader2 } from "react-icons/lu";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { notifier } from "@/shared/lib/format";
import { ArrowLeft, BadgeCheck, CarFront, CheckCircle2, FileText, Gauge, ImagePlus, Info, LockKeyhole, Sparkles } from "lucide-react";

type ListingFormDataInput = {
  fields: Record<string, string | number>;
  features: Record<string, boolean>;
  files: File[];
  id?: string | number;
  carImages?: string[];
};

const buildListingFormData = ({
  fields,
  features,
  files,
  id,
  carImages,
}: ListingFormDataInput) => {
  const payload = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      payload.append(key, String(value));
    }
  });

  payload.append("features", JSON.stringify(features));

  if (id) {
    payload.append("id", String(id));
  }

  if (carImages) {
    payload.append("carImages", JSON.stringify(carImages));
  }

  files.forEach((file) => {
    payload.append("images", file);
  });

  return payload;
};

const AddListing = () => {
  const [formData, setFormData] = useState<Record<string, string | number>>(
    Object.fromEntries(
      data.carDetails.map((carDetail) => [carDetail?.name, ""])
    )
  );
  const [selectedFileList, setSelectedFileList] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [carImages, setCarImages] = useState<string[]>([]);
  const [dataError, setDataError] = useState<Record<string, boolean>>(
    Object.fromEntries(
      data.carDetails
        ?.map((mappedItem) => {
          if (mappedItem?.required) {
            return [mappedItem?.name, false];
          }
          return null; // Explicitly return null for non-required items
        })
        .filter(Boolean) as [string, boolean][] // Remove any null or undefined entries
    ) || {}
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [featureData, setFeatureData] = useState<Record<string, boolean>>({});
  const { mutateAsync: createCar } = useCreateCar();
  const { mutateAsync: updateCar } = useUpdateCar();
  const { data: profileData, isLoading: isProfileLoading } = useSyncCurrentUser();

  const mode = searchParams.get("mode");
  const recordId = searchParams.get("id");
  const { data: car } = useGetParticularCar(recordId || "");
  const isEditMode = mode === "edit";
  const requiredFields = data.carDetails.filter((item) => item.required);
  const completedRequiredFields = requiredFields.filter((item) => {
    const value = formData[item.name] || car?.car?.[item.name];
    return value !== undefined && value !== null && value !== "";
  }).length;
  const selectedFeatureCount = Object.values(featureData || {}).filter(Boolean).length;
  const imageCount = (carImages?.length || 0) + selectedFileList.length;
  const marketplaceRole = profileData?.user?.role;
  const canManageListings = marketplaceRole === "seller" || marketplaceRole === "dealer";


  useEffect(() => {
    if (mode == "edit" && car?.car) {
      setFormData(
        Object.fromEntries(
          data.carDetails.map((carDetail) => [
            carDetail.name,
            car.car[carDetail.name] ?? "",
          ])
        )
      );
      setFeatureData(car.car.features || {});
      setCarImages(car.car.carImages || []);
    }
  }, [car, mode]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFeatureChange = (name: string, isChecked: boolean) => {
    setFeatureData((prev) => ({
      ...prev,
      [name]: isChecked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a copy of errors to update
      const updatedErrors: Record<string, boolean> = { ...dataError };
      let hasError = false;

    //   // Validate formData
      for (const key of Object.keys(dataError)) {
        if (formData[key] == '') {
          updatedErrors[key] = true; // Mark field as invalid
          hasError = true;
        } else {
          updatedErrors[key] = false;
        }
      }

    //   // Update the error state
      setDataError(updatedErrors);

    //   // If there are errors, stop the submission
      if (hasError) {
        toast.error('Please fill all the required fields');
        return;
      }else if (selectedFileList.length < 1) {
        toast.error('You must select at least one image');
        return
      }

    // Proceed with submission if no errors
    try {
      setIsLoading(true);

      await createCar(buildListingFormData({
        fields: formData,
        features: featureData,
        files: selectedFileList,
      }), {
        onSuccess: () => {
          setIsLoading(false);
           notifier({ message: 'Car created Successfully!', type: 'success' });
          navigate("/profile?tab=my-listing");
        },
        onError: (error) => {
          setIsLoading(false);
           notifier({ message: error?.message, type: 'error' });
        },
      });
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast("Updating car listing...");
    try {
      setIsLoading(true);
      await updateCar(buildListingFormData({
        fields: formData,
        features: featureData,
        files: selectedFileList,
        id: car?.car?.id || recordId || "",
        carImages,
      }), {
        onSuccess: () => {
          setIsLoading(false);
           notifier({ message: 'Car listing updated successfully!', type: 'success' });
          navigate("/profile?tab=my-listing");
        },
        onError: (error) => {
          setIsLoading(false);
           notifier({ message: error?.message, type: 'error' });
        },
      });
    } catch (error) {
      console.error("Error updating the car listing:", error);
      toast.error("Failed to update car listing");
    }
  };

  const removeImageFromListing = (imageUrl: string) => {
    setCarImages((prev) =>
      prev.filter(
        (prevImg) =>
          decodeURIComponent(prevImg) !== decodeURIComponent(imageUrl)
      )
    );
  };

  if (isProfileLoading) {
    return (
      <main className="mx-auto my-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </main>
    );
  }

  if (!canManageListings) {
    return (
      <main className="mx-auto my-10 max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-4 -ml-3 h-9 rounded-md text-slate-600">
          <Link to="/profile?tab=my-listing">
            <ArrowLeft className="size-4" />
            Back to profile
          </Link>
        </Button>
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-md bg-slate-100 text-slate-700">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Seller access required</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Only seller and dealer marketplace profiles can publish or edit vehicle listings. Buyer accounts can still browse cars and message sellers.
          </p>
          <Button asChild className="mt-6 rounded-md bg-slate-950 text-white hover:bg-slate-800">
            <Link to="/profile">Update profile details</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto my-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-3 -ml-3 h-9 rounded-md text-slate-600">
            <Link to="/profile?tab=my-listing">
              <ArrowLeft className="size-4" />
              Back to listings
            </Link>
          </Button>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            {isEditMode ? "Listing editor" : "Seller workspace"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {isEditMode ? "Edit vehicle listing" : "Add a vehicle listing"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create a polished listing with complete specifications, strong imagery, and buyer-ready details.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Completion</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{completedRequiredFields}/{requiredFields.length}</p>
          <p className="text-xs text-slate-500">required fields</p>
        </div>
      </div>

      <form onSubmit={isEditMode ? handleUpdate : handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-700">
                <CarFront className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Vehicle details</h2>
                <p className="mt-1 text-sm text-slate-500">Add the information buyers use to compare vehicles.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.carDetails.map((item, i) => (
                <div key={i} className={Number(item.column) === 2 ? "md:col-span-2" : ""}>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <IconField iconName={item.icon} />
                    <span>{item.label}</span>
                    {item.required && <span className="text-red-600">*</span>}
                  </label>
                  {item.fieldType === "text" || item.fieldType === "number" ? (
                    <InputField
                      item={item}
                      handleInputChange={handleInputChange}
                      value={formData[item.name] || ""}
                      dataError={dataError}
                    />
                  ) : item.fieldType === "dropdown" ? (
                    <DropdownField
                      item={item}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      dataError={dataError}
                    />
                  ) : item.fieldType === "textarea" ? (
                    <TextAreaField
                      item={item}
                      handleInputChange={handleInputChange}
                      value={formData[item.name] || ""}
                      dataError={dataError}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-700">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Features</h2>
                <p className="mt-1 text-sm text-slate-500">Select equipment and comfort options included with the vehicle.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {features.features.map((feature) => (
                <label key={feature.name} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50">
                  <Checkbox
                    onCheckedChange={(val: boolean) => handleFeatureChange(feature.name, val)}
                    checked={Boolean(featureData?.[feature.name])}
                    className="rounded border-slate-300"
                  />
                  {feature.label}
                </label>
              ))}
            </div>
          </section>

          <UploadImages
            selectedFileList={selectedFileList}
            setSelectedFileList={setSelectedFileList}
            carImages={carImages || []}
            removeImageFromListing={removeImageFromListing}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Listing summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-500"><Info className="size-4" /> Required fields</span>
                <span className="font-bold text-slate-950">{completedRequiredFields}/{requiredFields.length}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-500"><BadgeCheck className="size-4" /> Features</span>
                <span className="font-bold text-slate-950">{selectedFeatureCount}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-500"><ImagePlus className="size-4" /> Photos</span>
                <span className="font-bold text-slate-950">{imageCount}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-500"><Gauge className="size-4" /> Status</span>
                <span className="font-bold text-slate-950">{isEditMode ? "Editing" : "Draft"}</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <FileText className="size-4 text-blue-700" />
              Publishing checklist
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> Use a descriptive title with year, make, and model.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> Add multiple clear photos from different angles.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> Keep pricing and mileage accurate.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button asChild type="button" variant="outline" className="h-11 flex-1 rounded-md border-slate-300 bg-white">
              <Link to="/profile?tab=my-listing">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="h-11 flex-1 rounded-md bg-slate-950 text-white hover:bg-slate-800">
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <LuLoader2 className="animate-spin text-lg" /> {isEditMode ? "Saving" : "Publishing"}
                </span>
              ) : (
                isEditMode ? "Save changes" : "Publish"
              )}
            </Button>
          </div>
        </aside>
      </form>
    </main>
  );
};

export default AddListing;
