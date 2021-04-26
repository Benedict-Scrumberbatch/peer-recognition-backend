# Base image
FROM postgres
COPY ./pg-init.sql ./docker-entrypoint-initdb.d/
ENV POSTGRES_USER: "peer-recognition-user"
ENV POSTGRES_PASSWORD: "peer-recognition-password"
ENV POSTGRES_DB: "peer-recognition"