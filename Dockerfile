FROM node:20 AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia manifests e instala dependencias (reproducible en CI)
COPY package.json package-lock.json ./
RUN npm ci

# Copia todo el código fuente del proyecto al contenedor
COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

# SPA routing (Angular) + servir el output correcto (builder genera /browser)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/admin-cv/browser /usr/share/nginx/html

# Exponer el puerto 80 para que sea accesible
EXPOSE 80

# Comando para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
