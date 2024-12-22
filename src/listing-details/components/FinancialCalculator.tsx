import React, { useState } from "react";
import { carListing } from "../../utils/types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { formatCurrency } from "../../lib/utils";

const FinancialCalculator = ({
  car,
  loading,
}: {
  car: carListing;
  loading: boolean;
}) => {
// const [carPrice, setCarPrice] = useState(0)
const [interestRate, setInterestRate] = useState(0)
const [loanTerm, setLoanTerm] = useState(0)
const [downPayment, setDownPayment] = useState(0)
const [monthlyPayment, setMonthlyPayment] = useState(0)


// useEffect(() => {
// setCarPrice(Number(car?.sellingPrice))
// }, [car])
const carPrice:number=car?Number(car?.sellingPrice):0


const CalculateMonthlyPayment=()=>{
const principal=carPrice-downPayment
const monthlyInterestRate=interestRate/1200 // convert to decimal

const monthlyPayment=(principal*monthlyInterestRate*Math.pow(1+monthlyInterestRate,loanTerm))/(Math.pow(1+monthlyInterestRate,loanTerm)-1)

setMonthlyPayment(Number(monthlyPayment.toFixed(2)));

}
  return (
    <div>
      {loading ? (
        <div className="rounded-xl h-[300px] w-full bg-slate-200 animate-pulse"></div>
      ) : (
        <div className="p-5 rounded-xl bg-white shadow-md border">
          <h2 className="my-2 font-semibold md:text-2xl text-xl">
            Financial Calculator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="">Price</label>
              <Input
                className="border-gray-200 focus:border-primary rounded"
                type="number"
                readOnly
                value={String(carPrice)}
              />
            </div>
            <div>
              <label htmlFor="">Interest Rate</label>
              <Input
                className="border-gray-200 focus:border-primary rounded"
                type="number"
                onChange={(e)=>setInterestRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="">Loan Term(Months)</label>
              <Input
                className="border-gray-200 focus:border-primary rounded"
                type="number"
                onChange={(e)=>setLoanTerm(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="">Down Payment</label>
              <Input
                className="border-gray-200 focus:border-primary rounded"
                type="number"
                onChange={(e)=>setDownPayment(Number(e.target.value))}
              />
            </div>
          </div>
          {monthlyPayment>0&&<div className="mt-6 text-center">
          <h2 className="text-xl md:text-2xl font-medium">Your Monthly Payment </h2>
          <h2 className="text-xl mt-2 md:text-2xl italic font-bold">{formatCurrency(monthlyPayment)}</h2>
          </div>}
           <Button disabled={monthlyPayment<1} size='lg' className='rounded w-full text-white mt-6' onClick={CalculateMonthlyPayment}>Calcualte</Button>
        </div>
      )}
    </div>
  );
};

export default FinancialCalculator;
