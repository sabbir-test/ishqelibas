import HeroSection from "@/components/sections/HeroSection"
import FeaturedProducts from "@/components/sections/FeaturedProducts"
import ProductCategories from "@/components/sections/ProductCategories"
import AboutUs from "@/components/sections/AboutUs"
import CustomerReviews from "@/components/sections/CustomerReviews"
import PromotionalBanner from "@/components/sections/PromotionalBanner"
import ContactSection from "@/components/sections/ContactSection"
import AddToCartTest from "@/components/test/AddToCartTest"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProducts />
      <ProductCategories />
      <AboutUs />
      <CustomerReviews />
      <PromotionalBanner />
      <ContactSection />
      <AddToCartTest />
    </div>
  )
}