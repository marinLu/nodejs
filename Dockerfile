# 指定我们的基础镜像是node，版本是v8.0.0
FROM node:8.11.1
# 指定制作我们的镜像的联系人信息（镜像创建者）
MAINTAINER Tsl

# 将根目录下的文件都copy到container（运行此镜像的容器）文件系统的app文件夹下
ADD . /app/
# cd到app文件夹下
WORKDIR /app

# 安装项目依赖包
RUN npm install
RUN npm rebuild node-sass --force

# 配置环境变量
ENV NODE_ENV production
ENV SERVICE_NAME blueplusservice
ENV HOST 0.0.0.0
ENV PORT 5000
ENV DB_NAME blueplus
ENV DB_USERNAME tsl
ENV DB_PASSWORD Tsl@2018
ENV DB_HOST tsl-sh-rd.mysql.rds.aliyuncs.com
ENV DB_PORT 3306
ENV DB_DIALECT mysql
ENV ELS_HOST 47.75.190.168:9200
ENV MQTT_HOST ws://47.75.190.168:3000
ENV REDIS_HOST 106.75.249.247
ENV REDIS_PORT 6379


# 容器对外暴露的端口号
EXPOSE 5000

# 容器启动时执行的命令，类似npm run start
CMD ["npm", "start"]