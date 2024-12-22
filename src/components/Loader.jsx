import { ImSpinner9 } from "react-icons/im";

const Loader = () => {
  return (
    <div className="h-[25rem] flex justify-center items-center">
      <ImSpinner9 className="animate-spin text-[#3538CD] text-[5rem]" />
    </div>
  );
};

export default Loader;
