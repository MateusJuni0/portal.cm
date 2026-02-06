FROM nginx:alpine
# Copia todos os arquivos da pasta atual para o Nginx
COPY . /usr/share/nginx/html
EXPOSE 80
