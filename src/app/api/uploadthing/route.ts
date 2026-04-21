import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exporta los manejadores para las peticiones GET y POST que hará el componente visual
export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});