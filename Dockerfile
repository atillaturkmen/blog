FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN npm install
# RUN exec -i db mysql -u root -p 123456 mydb < blog-database.sql
# ENTRYPOINT docker exec -i db mysqldump -uroot -p123456 --databases mydb --skip-comments > C:\Users\Atilla\blog\blog-database.sql

CMD [ "npm", "start" ]