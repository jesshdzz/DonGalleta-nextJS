import { IceCream, ImageIcon, Package, ShoppingCart, Store, Users } from "lucide-react";

export const adminPages = [
    {
        title: "Pedidos",
        description: "Gestionar órdenes y envíos",
        href: "/admin/pedidos",
        icon: ShoppingCart,
    },
    {
        title: "Productos",
        description: "Catálogo, precios y stock",
        href: "/admin/productos",
        icon: Package,
    },
    {
        title: "Usuarios",
        description: "Gestionar usuarios",
        href: "/admin/usuarios",
        icon: Users,
    },
    {
        title: "Sabores",
        description: "Variedades y opciones",
        href: "/admin/sabores",
        icon: IceCream,
    },
    {
        title: "Tiendas",
        description: "Sucursales y ubicaciones",
        href: "/admin/tiendas",
        icon: Store,
    },
    {
        title: "Banners",
        description: "Imagenes, promociones y destacados",
        href: "/admin/banners",
        icon: ImageIcon,
    },
]