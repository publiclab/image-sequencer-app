FROM node:10
ENV NODE_ENV production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
EXPOSE 4000
CMD npm start