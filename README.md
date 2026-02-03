# Manual de Instalación y Desarrollo - Don Galleta

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
## Sincronizar el Cliente Prisma
Ejecuta el siguiente comando para que se generen los modelos de Prisma en tu proyecto.
```bash
npx prisma generate
# NO hace falta hacer db push, la base de datos ya está lista en la nube.
```
## Arranque
Finalmente, ejecuta este comando para visualizar la pagina en `http://localhost:3000/`:
```bash
npm run dev
```
Para visualizar la base de datos en la nube, ejecuta este comando:
```bash
npx prisma studio
```


## Workflow de Git
Por favor, sigue estas recomendaciones para tener un espacio de trabajo colaborativo limpio y sin problemas.
- Nunca hagas commit directo a main.
- Crea tu rama por cada cambio que hagas: git checkout -b nombre-tarea
- Haz Pull Request  al terminar.

