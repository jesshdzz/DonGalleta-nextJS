import { getProductById } from "@/actions/product-actions";
import { isFavorite } from "@/actions/favorite-actions";
import { getProductReviews, getUserReview } from "@/actions/review-actions";
import { getPromotionsForProduct } from "@/actions/promotion-actions";
import AddToCartButton from "@/components/carro/AddToCartButton";
import FavoriteButton from "@/components/ui/favorite-button";
import WaitingListButton from "@/components/waiting-list-button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Package, Gift, BadgePercent, BadgeDollarSign } from "lucide-react";
import { auth } from "@/auth";
import { RelatedProducts } from "@/components/features/RelatedProducts";
import { RelatedProductsSkeleton } from "@/components/features/RelatedProductsSkeleton";
import { ProductRating } from "@/components/features/ProductRating";
import { ReviewList } from "@/components/features/ReviewList";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  // Validación: si el ID no es un número válido
  if (isNaN(productId)) {
    notFound();
  }

  // 2. Obtener datos desde el Server Action
  const product = await getProductById(productId);

  // Si no existe el producto, mostrar página 404
  if (!product) {
    notFound();
  }

  // 3. Paralelizamos todas las consultas independientes para evitar waterfall
  const [
    { isFavorite: isProductFavorite },
    session,
    reviewsData,
    userReview,
    productPromotions,
  ] = await Promise.all([
    isFavorite(productId),
    auth(),
    getProductReviews(productId),
    getUserReview(productId),
    getPromotionsForProduct(productId),
  ]);

  // 6. Lógica de imagen (Placeholder si está vacía)
  const imageUrl = product.image && product.image.trim() !== ""
    ? product.image
    : "https://placehold.co/600x600/png?text=Sin+Imagen";

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      {/* Botón Volver */}
      <div className="mb-8">
        <Link href="/productos">
          <Button
            variant="ghost"
            className="pl-0 gap-2 hover:bg-transparent hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary/20 border border-border/50 shadow-sm group">
          <Image
            src={imageUrl}
            alt={product.name}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col space-y-8">
          <div>
            {/* Header con título, favoritos y stock */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4">
                <h1 className="text-4xl font-bold text-primary tracking-tight">
                  {product.name}
                </h1>
                <div className="mt-1">
                  <FavoriteButton
                    productId={product.id}
                    initialIsFavorite={isProductFavorite}
                    size="lg"
                    variant="outline"
                  />
                </div>
              </div>

              {/* Badge de Stock */}
              {product.stock > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-3 py-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> En stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                  <XCircle className="w-3.5 h-3.5" /> Agotado
                </Badge>
              )}
            </div>

            <p className="text-3xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </p>

            {/* Bloque de Promociones */}
            {productPromotions.length > 0 && (
              <div className="my-5">
                {productPromotions.map((promo) => {
                  const isPercent = promo.type === "PERCENTAGE";
                  const isFixed = promo.type === "FIXED";
                  const Icon = isPercent ? BadgePercent : isFixed ? BadgeDollarSign : Gift;
                  const colorClass = isPercent
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : isFixed
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-purple-200 bg-purple-50 text-purple-800";

                  const valueLabel = isPercent
                    ? `${promo.value}% de descuento`
                    : isFixed
                      ? `$${promo.value.toFixed(2)} de descuento`
                      : promo.buyQuantity && promo.getQuantity
                        ? `Compra ${promo.buyQuantity}, lleva ${promo.getQuantity} gratis`
                        : "Compra y lleva gratis";

                  return (
                    <div
                      key={promo.id}
                      className={`flex flex-row items-start gap-3 rounded-lg border px-4 py-3 text-sm ${colorClass}`}
                    >
                      <Icon className="h-6 w-6 shrink-0 mt-1.5" />
                      <div className="space-y-0.5">
                        <p className="font-serif font-bold text-lg">{promo.name}</p>
                        <p className="font-medium">{valueLabel}</p>
                        {promo.type !== "BUY_X_GET_Y" && promo.minOrderAmount != null && promo.minOrderAmount > 0 && (
                          <p className="text-xs opacity-80">Compra mínima: ${promo.minOrderAmount.toFixed(2)}</p>
                        )}
                        {isPercent && promo.maxDiscountCap != null && promo.maxDiscountCap > 0 && (
                          <p className="text-xs opacity-80">Descuento máximo: ${promo.maxDiscountCap.toFixed(2)}</p>
                        )}
                        <p className="text-xs opacity-70 mt-0">
                          Válido hasta el {new Date(promo.expirationDate).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Card className="bg-secondary/10 border-none shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                <Package className="w-4 h-4" /> Descripción
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ||
                  "Este producto es una deliciosa creación de la casa, elaborada con los mejores ingredientes para garantizar su frescura y sabor."}
              </p>
            </CardContent>
          </Card>

          <div className="pt-6 border-t border-border">
            {product.stock > 0 ? (
              <div className="space-y-4">
                <div className="w-full">
                  <AddToCartButton product={{ ...product }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button disabled size="lg" className="w-full text-lg opacity-80" variant="secondary">
                  No disponible por el momento
                </Button>
                {session?.user && (
                  <WaitingListButton
                    productId={product.id}
                    initialStock={product.stock}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streaming de productos relacionados */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts currentProductId={product.id} />
      </Suspense>

      {/* Sección de opiniones */}
      <div className="mt-12 space-y-8">
        <ProductRating productId={product.id} initialReview={userReview} />
        <ReviewList
          reviews={reviewsData.reviews}
          averageRating={reviewsData.averageRating}
          totalReviews={reviewsData.totalReviews}
        />
      </div>
    </div>
  );
}
