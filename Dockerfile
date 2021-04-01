
#----------------

# ---- Base Node ----
FROM --platform=$BUILDPLATFORM alpine:3.12 AS base
# install node
RUN apk add --no-cache nodejs-current tini
# set working directory
WORKDIR /etc/icons
# Set tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]
# copy project file
COPY package.json .


# Prepare base images with go opts for each target architecture
FROM base AS base-armv5
#ENV GO_ARCH_OPS "CGO_ENABLED=0 GOARCH=arm GOARM=5"

FROM base AS base-armv6
#ENV GO_ARCH_OPS "CGO_ENABLED=0 GOARCH=arm GOARM=6"

FROM base AS base-armv7
#ENV GO_ARCH_OPS "CGO_ENABLED=0 GOARCH=arm GOARM=7"

FROM base AS base-arm64
#ENV GO_ARCH_OPS "CGO_ENABLED=0 GOARCH=arm64"

FROM base AS base-amd64
#ENV GO_ARCH_OPS "CGO_ENABLED=0 GOARCH=amd64"

# ---- Dependencies ----
# Use the target architecture base image as builder target
ARG TARGETARCH
ARG TARGETVARIANT
FROM base-$TARGETARCH$TARGETVARIANT AS dependencies
#
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

#
# ---- Test ----
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN  npm run lint && npm run test

#
# ---- Release ----
ARG TARGETARCH
ARG TARGETVARIANT
FROM base-$TARGETARCH$TARGETVARIANT AS release
# copy production node_modules
COPY --from=dependencies /etc/icons/prod_node_modules ./node_modules
# copy app sources
COPY . .
# expose port and define CMD
EXPOSE 8080
CMD npm run start



