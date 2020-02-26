.PHONY: help run_dev test build_ts build_manifest build_image push_image

APP_NAME?=studio-plugins
PROJECT?=bbp-ou-nse
IMAGE_TAG?=latest
DOCKER_REGISTRY?=docker-registry-default.ocp.bbp.epfl.ch

NODE_MODULES:=node_modules

define HELPTEXT
Makefile usage
 Targets:
    run_dev               Run development web server.
    test                  Run tests.
    build_ts              Transpile and bundle plugin code.
    build_manifest        Create a plugin manifest based on packages built.
    build_image           Build a docker image containing plugins and a manifest file.
    push_image            Push current image into a docker registry. To customize
                            check environment variables in Makefile.
endef
export HELPTEXT

help:
	@echo "$$HELPTEXT"

$(NODE_MODULES):
	npm install

run_dev: $(NODE_MODULES)
	npm run start

test: | $(NODE_MODULES)
	npm run test

build_ts: | $(NODE_MODULES)
	rm -f dist/*
	npx webpack

build_manifest: build_ts
	node build-tools/generate-manifest.js

build_image: build_manifest
	docker build -t $(APP_NAME) .

push_image:
	docker tag \
		$(APP_NAME):latest \
		$(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
