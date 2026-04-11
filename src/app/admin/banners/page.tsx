import { getBanners } from "@/actions/banner-actions";
import { BannersClient } from "./BannersClient";

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return <BannersClient initialBanners={banners as Parameters<typeof BannersClient>[0]["initialBanners"]} />;
}