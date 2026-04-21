import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

// Define las rutas y reglas de subida
export const ourFileRouter = {
    productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            // Validamos la sesión del usuario actual
            const session = await auth();

            // Verificamos si existe la sesión y si el rol del usuario es "ADMIN"
            if (!session?.user || session.user.role !== "ADMIN") {
                throw new UploadThingError("No autorizado: Se requieren permisos de administrador para subir imágenes.");
            }

            // Retornamos el ID del usuario al onUploadComplete
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // Este código corre en el servidor después de que la imagen se subió a AWS
            console.log("Upload completo por administrador ID:", metadata.userId);
            console.log("URL del archivo:", file.url);

            // DEBEMOS retornar algo al cliente
            return { url: file.url };
        }),
        // Agrega esto justo debajo de tu productImage en ourFileRouter
    bannerImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth();
            if (!session?.user || session.user.role !== "ADMIN") {
                throw new UploadThingError("No autorizado.");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Banner subido por admin:", metadata.userId);
            return { url: file.url };
        }),
    // Endpoint para la foto de perfil (usado en VistaPerfil)
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth();
            if (!session?.user) {
                throw new UploadThingError("No autorizado.");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Foto de perfil subida por usuario:", metadata.userId);
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


//TODO: agregar endpoints para los banners, nuevo archivo banner-actions.ts, y la pagina en admin/banners