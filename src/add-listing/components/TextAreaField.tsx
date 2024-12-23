import { Textarea } from '../../components/ui/textarea'


type itemTypes= {
      label: string,
      name: string,
      fieldType: string,
      required?: boolean,
      column: number|string,
      options?: string[],
      icon: string
    }

       type passedProps={
       carInfo:{[key:string]:number|string};
       dataError:{[key:string]:boolean};
    item:itemTypes;
      handleInputChange:(name:string,value:string|number)=>void
    }
const TextAreaField = ({item,handleInputChange,carInfo,dataError}:passedProps) => {
  return (
    <div>
    <Textarea onChange={(e)=>handleInputChange(item?.name,e.target.value)} className={`${dataError?.[item?.name]?'border-red-500':'border-gray-200'} focus:border-primary rounded`} defaultValue={carInfo?.[item?.name]} name={item?.name} />
    { dataError?.[item?.name] && <span className='text-sm text-red-500 mt-2'>{(item?.label)?.toLowerCase()} is required</span>}
    </div>
  )
}

export default TextAreaField