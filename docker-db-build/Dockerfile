# Base image
FROM postgres
COPY ./pg-init.sql ./docker-entrypoint-initdb.d/
ARG POSTGRES_USER="peer-recognition-user"
ARG POSTGRES_PASSWORD="peer-recognition-password"
ARG POSTGRES_DB="peer-recognition"
ARG PGDATA="/var/lib/postgresql/data/peer-recognition-data"
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV PGDATA=$PGDATA
RUN echo "pg data:" ${PGDATA}