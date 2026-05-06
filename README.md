# Manual de Instalación y Desarrollo - Don Galleta
[!NOTE]
Para una documentación mas detallada, visita: [![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/jesshdzz/DonGalleta-nextJS)

Sigue esta guía paso a paso para levantar el entorno localmente sin errores.

## 1. Prerrequisitos

Antes de empezar, asegúrate de tener instalado:
1. Node.js: Versión 20 o superior (Requerido para Next.js 16).
	- Verificar: `node -v`
2. Git: Para clonar el repo.
3. VS Code: Con la extensión "Prisma" y "Tailwind CSS IntelliSense" instaladas.

## 2. Instalación del Proyecto
### 2.1: Clonar el repositorio
Abre tu terminal en la carpeta donde guardas tus proyectos:
```Bash
git clone <URL_DEL_REPO_GITHUB>
cd don-galleta
```
### 2.2: Instalar Dependencias
Instala todas las librerías del proyecto (incluyendo Next.js 16, Prisma y Shadcn).
```Bash
npm install
```
  
## 3. Configuración de Entorno (.env)
- Crea un archivo `.env` en la raíz (Si aún no esta creada). 
- Pega la url de conexión del proyecto (NUNCA la subas a GitHub, por favor).
 ```bash
 DATABASE_URL="aquí pon la url" 
```
## 4. Sincronizar el Cliente Prisma
Ejecuta el siguiente comando para que se generen los modelos de Prisma en tu proyecto.
```bash
npx prisma generate
# NO hace falta hacer db push, la base de datos ya está lista en la nube.
```

## 5. Crear un Secret Auth
Ejecuta el siguiente comando para generar un secret auth:
```bash
npx auth secret
```

## 6. Arranque
Finalmente, ejecuta este comando para visualizar la pagina en `http://localhost:3000/`:
```bash
npm run dev
```
Para visualizar la base de datos en la nube, ejecuta este comando:
```bash
npx prisma studio
```

# Stack Tecnológico
- **Framework:** Next.js 16 (App Router) + React 19.
- **BD:** Prisma + MariaDB/MySQL.
- **Auth:** NextAuth v5 (Beta).
- **Estilos:** Tailwind CSS 4 + shadcn/ui.
- **Testing:** Vitest.

## Comandos Importantes
- `npx prisma generate`: **Requerido** después de `npm install` o cambios en el schema.
- `npx auth secret`: **Requerido** para inicializar `AUTH_SECRET`.
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run test`: Ejecuta las suites de Vitest (principalmente acciones del servidor en `src/__tests__`).
- `npm run lint`: Ejecuta ESLint.

## Arquitectura
- **Server Actions:** Ubicación principal de la lógica de la base de datos y mutaciones, se encuentran en `src/actions/`.
- **Aliases de ruta:** Usar `@/` para `src/`.
- **Base de Datos:** La base de datos de producción/staging se gestiona externamente. **No ejecutar `npx prisma db push` o `prisma migrate dev`** a menos que se indique explícitamente; solo usar `prisma generate` para actualizar el cliente local.
- **Entorno:** Requiere `DATABASE_URL` en `.env`.
- **Git:** Nunca hacer commit directo a `main`. Usar ramas de características y PRs.

## Estándares de Diseño
Sigue los códigos de colores de la marca estrictamente para el trabajo de UI:
- **Primary:** `#58321D` (Coffee Brown)
- **Secondary / Accent:** `#F7DCBE` (Beige/Cream)
- **Destructive:** `#A42D2C` (Red)
- **Muted:** `#C69A8F`
- **Border / Input:** `#A6A3A2`
- **Card:** `#FFFFFF`

## Notas
- **Next.js 16:** El proyecto utiliza una versión experimental/beta (16.1.6). Ten en cuenta los comportamientos específicos de React 19.
- **Tailwind 4:** Utiliza `@tailwindcss/postcss`. No se encuentra `tailwind.config.js` ya que la configuración del tema se encuentra en `src/app/globals.css`.