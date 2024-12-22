import { user } from "../../utils/types";
import { Button } from "../../components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const OwnerDetails = ({
  creator,
  loading,
}: {
  creator: user;
  loading: boolean;
  title: string;
  carId: number | string;
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const messageOwner = async () => {
 navigate(`/profile?tab=inbox&id=${creator?.id}`);
  };
  return (
    <div>
      {loading ? (
        <div className="rounded-xl h-[200px] w-full bg-slate-200 animate-pulse"></div>
      ) : (
        <div className="p-5 md:p-10 rounded-xl bg-white shadow-md border">
          <h2 className="mb-4 font-semibold md:text-2xl text-xl">
            Owner Details
          </h2>
          <div className="flex gap-4">
            <img
              src={creator?.imageUrl}
              alt=""
              className="h-[70px] w-[70px] rounded-full"
            />
            <div>
              <h2 className="font-bold md:text-lg line-clamp-1">
                {creator?.name}
              </h2>
              <p className="text-gray-400 text-sm md:text-medium line-clamp-1">
                {creator?.email}
              </p>
            </div>
          </div>
          <Button
          disabled={user?.primaryEmailAddress?.emailAddress==creator?.email}
            size="lg"
            onClick={messageOwner}
            className="rounded w-full text-white mt-6"
          >
            Message Owner
          </Button>
        </div>
      )}
    </div>
  );
};

export default OwnerDetails;
