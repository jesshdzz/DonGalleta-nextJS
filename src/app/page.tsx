import { Hero } from "@/components/features/Hero";
import { ProductCarousel } from "@/components/features/ProductCarousel";
import { Promotions } from "@/components/features/Promotions";
import Banner, { BannerItem } from "@/components/features/Banner";
import { getBanners } from "@/actions/banner-actions";

export default async function Home() {
  const dbBanners = await getBanners(true);

  const promoBanners: BannerItem[] = dbBanners.map((b) => ({
    id: b.id,
    image: b.imageUrl,
    alt: b.title,
    targetUrl: b.targetUrl,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      {promoBanners.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-4 mb-2 md:mt-8 md:mb-6">
          <Banner banners={promoBanners} />
        </div>
      )}
      
      <ProductCarousel />
      <Promotions />
    </div>
  );
}