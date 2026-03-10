import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define las rutas y reglas de subida
export const ourFileRouter = {
    productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            // Aquí se verifica si el usuario es Admin antes de dejarle subir.
            // Por ahora, lo dejamos pasar.
            return { uploadedBy: "Admin" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // Este código corre en el servidor después de que la imagen se subió a AWS
            console.log("Upload completo por:", metadata.uploadedBy);
            console.log("URL del archivo:", file.url);

            // DEBEMOS retornar algo al cliente
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;