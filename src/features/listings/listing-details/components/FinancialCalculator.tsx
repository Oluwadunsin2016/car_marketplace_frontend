import { useState } from "react";
import { carListing } from "@/shared/types/marketplace";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { formatCurrency } from "@/shared/lib/format";
import { Calculator } from "lucide-react";

const FinancialCalculator = ({
  car,
  loading,
}: {
  car?: carListing;
  loading: boolean;
}) => {
const [interestRate, setInterestRate] = useState(0)
const [loanTerm, setLoanTerm] = useState(0)
const [downPayment, setDownPayment] = useState(0)
const [monthlyPayment, setMonthlyPayment] = useState(0)

const carPrice:number=car?Number(car?.sellingPrice):0


const CalculateMonthlyPayment=()=>{
const principal=carPrice-downPayment
const monthlyInterestRate=interestRate/1200 // convert to decimal

if (principal <= 0 || loanTerm <= 0) {
setMonthlyPayment(0)
return
}

if (monthlyInterestRate === 0) {
setMonthlyPayment(Number((principal / loanTerm).toFixed(2)))
return
}

const monthlyPayment=(principal*monthlyInterestRate*Math.pow(1+monthlyInterestRate,loanTerm))/(Math.pow(1+monthlyInterestRate,loanTerm)-1)

setMonthlyPayment(Number(monthlyPayment.toFixed(2)));

}
  return (
    <div>
      {loading ? (
        <div className="h-[300px] w-full animate-pulse rounded-lg bg-slate-200"></div>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Payment estimate
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Finance calculator</h2>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Calculator className="size-5" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vehicle price</label>
              <Input
                className="rounded-md border-slate-200 bg-slate-50"
                type="number"
                readOnly
                value={String(carPrice)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Interest rate</label>
              <Input
                className="rounded-md border-slate-200"
                type="number"
                placeholder="e.g. 12"
                onChange={(e)=>setInterestRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Loan term months</label>
              <Input
                className="rounded-md border-slate-200"
                type="number"
                placeholder="e.g. 36"
                onChange={(e)=>setLoanTerm(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Down payment</label>
              <Input
                className="rounded-md border-slate-200"
                type="number"
                placeholder="e.g. 5000000"
                onChange={(e)=>setDownPayment(Number(e.target.value))}
              />
            </div>
          </div>
          {monthlyPayment>0&&<div className="mt-6 rounded-lg bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Estimated monthly payment</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
          </div>}
           <Button size='lg' className='mt-6 w-full rounded-md bg-slate-950 text-white hover:bg-slate-800' onClick={CalculateMonthlyPayment}>Calculate payment</Button>
        </section>
      )}
    </div>
  );
};

export default FinancialCalculator;
