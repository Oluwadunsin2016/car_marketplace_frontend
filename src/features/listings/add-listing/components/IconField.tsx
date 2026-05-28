import { ReactElement } from 'react';
import { FaClipboardList, FaTag, FaDollarSign, FaMoneyBillAlt, FaCar, FaCheckCircle, FaIndustry, FaCarSide, FaCalendarAlt, FaRoad, FaCogs, FaGasPump, FaTachometerAlt, FaWrench, FaCircle, FaPalette, FaDoorClosed, FaIdCard, FaTags, FaFileAlt } from 'react-icons/fa';


const IconField = ({iconName}:{iconName:string}) => {
const iconMap:Record<string, ReactElement>  = {
  FaClipboardList: <FaClipboardList />,
  FaTag: <FaTag />,
  FaDollarSign: <FaDollarSign />,
  FaMoneyBillAlt: <FaMoneyBillAlt />,
  FaCar: <FaCar />,
  FaCheckCircle: <FaCheckCircle />,
  FaIndustry: <FaIndustry />,
  FaCarSide: <FaCarSide />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaRoad: <FaRoad />,
  FaCogs: <FaCogs />,
  FaGasPump: <FaGasPump />,
  FaTachometerAlt: <FaTachometerAlt />,
  FaWrench: <FaWrench />,
  FaCircle: <FaCircle />,  
  FaPalette: <FaPalette />,
  FaDoorClosed: <FaDoorClosed />,
  FaIdCard: <FaIdCard />,
  FaTags: <FaTags />,
  FaFileAlt: <FaFileAlt />,
};

  return (
    <span className='grid size-7 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700'>{iconMap[iconName]}</span>
  )
}

export default IconField
