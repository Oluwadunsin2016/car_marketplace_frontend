const InfoSection  = () => {
  return (
   <section>
  <div className="mx-auto max-w-screen-2xl py-16 px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:h-screen lg:grid-cols-2">
      <div className="relative z-10 lg:py-16">
        <div className="relative h-64 sm:h-80 lg:h-full">
          <img
            alt=""
            src="https://carwalk.de/wp-content/uploads/2019/04/Mercedes-Benz-GLS-02.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="relative flex items-center bg-gray-100">
        <span
          className="hidden lg:absolute lg:inset-y-0 lg:-start-16 lg:block lg:w-16 lg:bg-gray-100"
        ></span>

        <div className="p-8 sm:p-16 lg:p-24">
          <h2 className="text-2xl font-bold sm:text-3xl">
          Find Your Perfect Ride — Quality Cars, Trusted Deals
          </h2>

          <p className="mt-4 text-gray-600">
          Explore a wide range of vehicles from top brands — whether you're searching for a sleek sedan, rugged SUV, or a fuel-efficient compact car, we've got you covered. Our platform connects you with the best deals, trusted sellers, and hassle-free financing options. With a smooth browsing experience and expert customer support, buying your next car has never been this easy.
          </p>
<div className="flex items-center justify-end">
<a
  href="mailto:oluwadunsin2016@gmail.com"
  className="mt-8 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500 transition-all duration-500"
>
  Get in Touch
</a>
</div>
        </div>
      </div>
    </div>
  </div>
</section>
  )
}

export default InfoSection 