import { Hero } from "@/components/features/Hero";
import { ProductCarousel } from "@/components/features/ProductCarousel";
import { Promotions } from "@/components/features/Promotions";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ProductCarousel />
      <Promotions />
    </div>
  );
}