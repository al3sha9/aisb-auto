export default function Stats() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
             Benefits & Perks You&nbsp;ll Love
          </h2>
          <p className="mt-6 text-base/7 text-gray-600">
             Explore the incredible advantages of enrolling in our courses and enhancing your skills for the ultimate career success.
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-gray-50 p-8 sm:w-3/4 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start">
            <p className="flex-none text-3xl font-bold tracking-tight text-gray-900">100 Seats</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-gray-900">Fully Funded Education</p>
              <p className="mt-2 text-base/7 text-gray-600">Zero tuition fees for selected students, We Pay You Learn </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-gray-900 p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-44">
            <p className="flex-none text-3xl font-bold tracking-tight text-white">$8.9 billion</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-white">
                We’re proud that our Students have made over $8 billion in total revenue.
              </p>
              <p className="mt-2 text-base/7 text-gray-400">
                Biggest Milestone for Pakistan
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-primary p-8 sm:w-11/12 sm:max-w-xl sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-none lg:flex-auto lg:flex-col lg:items-start lg:gap-y-28">
            <p className="flex-none text-3xl font-bold tracking-tight text-white">401,093</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-white">AI Apps this year</p>
              <p className="mt-2 text-base/7 text-indigo-200">
                Our Students have built Tons of unicorns this year alone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}