
// import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import Stats from "@/components/landing/Stats"
import Courses from "@/components/landing/Courses"
// import Perks from "@/components/landing/Perks"
// import Skills from "@/components/landing/Skills"
import FAQ from "@/components/landing/FAQ"
// import Testimonials from "@/components/landing/Testimonials"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <>
    {/* <Navbar /> */}
    <Hero />
      <FinalCTA />
    <Stats />
    <Courses />
    <FAQ />
    {/* <Testimonials /> */}

    <Footer />
    </>
  )
}