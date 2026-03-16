# 构建阶段
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 确保读取 .env 并执行构建
RUN npm run build

# 运行阶段
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 复制自定义 Nginx 配置以支持前端路由
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]