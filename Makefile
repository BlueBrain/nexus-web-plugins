.PHONY: help build_js build_manifest build_image push_image

APP_NAME?=studio-plugins
PROJECT?=bbp-ou-nexus
IMAGE_TAG?=latest
DOCKER_REGISTRY?=docker-registry-default.ocp.bbp.epfl.ch

NODE_MODULES:=node_modules

define HELPTEXT
Makefile usage
 Targets:
    run_dev               Run development web server.
    build                 Build web app into dist folder.
    docker_build_version  Build frontend local docker image with the version tag.
    docker_build_latest   Build frontend local docker image with the latest tag.
    docker_push_version   Tag docker image with version and push to OpenShift registy.
    docker_push_latest    Tag docker image with latest and push to OpenShift registy
                            This will result in the updated frontend running in OpenShift.
endef
export HELPTEXT

help:
	@echo "$$HELPTEXT"

$(NODE_MODULES):
	npm install

run_dev: $(NODE_MODULES)
	npm run start

build_js: | $(NODE_MODULES)
	rm -f dist/*
	npx webpack

test: | $(NODE_MODULES)
	npm run test

build_manifest: build_js
	node build-tools/generate-manifest.js

build_image: build_manifest
	docker build -t $(APP_NAME) .

push_image:
	docker tag \
		$(APP_NAME):latest \
		$(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
