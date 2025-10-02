import Image from "next/image";

export default function FinalCTA() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <Image
            alt="Transistor"
            src="https://cdn.worldvectorlogo.com/logos/chatgpt-3.svg"
            width={158}
            height={48}
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
          />

            <Image
              alt="Statamic"
              src="https://cdn.worldvectorlogo.com/logos/crewai-1.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
            />
          <Image
            alt="Tuple"
            src="https://cdn.worldvectorlogo.com/logos/claude-3.svg"
            width={158}
            height={48}
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
          />

           <Image
            alt="Reform"
            src="https://cdn.worldvectorlogo.com/logos/gemini-ai.svg"
            width={158}
            height={48}
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
          />
           <Image
            alt="SavvyCal"
            src="https://cdn.worldvectorlogo.com/logos/langchain-1.svg"
            width={158}
            height={48}
            className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
          />
        </div>
      </div>
    </div>
  )
}