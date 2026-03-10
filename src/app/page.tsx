import { Hero } from "@/components/features/Hero";
import { ProductCarousel } from "@/components/features/ProductCarousel";
import { Promotions } from "@/components/features/Promotions";
import Banner, { BannerItem } from "@/components/features/Banner";
export default function Home() {
  const promoBanners: BannerItem[] = [
    {
      id: 1,
      image: "https://placehold.co/1200x400/png?text=Lanzamiento+Primavera",
      alt: "Lanzamiento de Primavera",
    },
    {
      id: 2,
      image:
        "https://placehold.co/1200x400/png?text=2x1+en+Galletas+de+Chocolate",
      alt: "Promoción 2x1",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Banner banners={promoBanners} />
      <ProductCarousel />
      <Promotions />
    </div>
  );
}
