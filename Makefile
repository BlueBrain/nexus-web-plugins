.PHONY: help run_dev test lint style run_qa run_qa_in_docker build_ts build_manifest build_dist build_dist_in_docker build_image push_image

APP_NAME?=studio-plugins
PROJECT?=fusion
IMAGE_TAG?=2023-07-17-amd64
DOCKER_REGISTRY?=bbpgitlab.epfl.ch:5050/nise

NODE_MODULES:=node_modules
ROOT_NPM:=.npm

define HELPTEXT
Makefile usage
 Targets:
    run_dev               Run development web server.
    test                  Run tests.
		lint                  Run lint check.
		style                 Run style check.
		run_qa                Perform lint and style check, run tests.
		run_qa_in_docker      Execute run_qa target in a docker container.
    build_ts              Transpile and bundle plugin code.
    build_manifest        Create a plugin manifest based on packages built.
		build_dist            Alias to build_manifest. Build manifest and JS files.
		build_dist_in_docker  Execute build_dist in a docker container.
    build_image           Build a docker image containing plugins and a manifest file.
    push_image            Push current image into a docker registry. To customize
                            check environment variables in Makefile.
endef
export HELPTEXT

help:
	@echo "$$HELPTEXT"

$(NODE_MODULES):
	npm install --legacy-peer-deps

$(ROOT_NPM):
	mkdir -p $(ROOT_NPM)

run_dev: $(NODE_MODULES)
	npm run start

test: | $(NODE_MODULES)
	npm run test

lint: | $(NODE_MODULES)
	npm run lint

style: | $(NODE_MODULES)
	npm run style

run_qa: lint | $(NODE_MODULES)

run_qa_in_docker: | $(ROOT_NPM)
	docker run \
		--rm \
		-u $$(id -u ${USER}):$(id -g ${USER}) \
		-v $$(pwd):/app:z \
		-v $$(pwd)/.npm:/.npm:z \
		-w /app \
		--env HTTP_PROXY="http://bbpproxy.epfl.ch:80/" \
		--env HTTPS_PROXY="http://bbpproxy.epfl.ch:80/" \
		--entrypo
		node:lts  \
			-c "make run_qa"

build_ts: | $(NODE_MODULES)
	rm -f dist/*
	NODE_OPTIONS="--max-old-space-size=8192" npx webpack

build_manifest: build_ts
	node build-tools/generate-manifest.js

build_dist: build_manifest

build_dist_and_host: build_dist
	node src/server.js

build_dist_in_docker: | $(ROOT_NPM)
	docker run \
		--rm \
		-u $$(id -u ${USER}):$(id -g ${USER}) \
		-v $$(pwd):/app:z \
		-v $$(pwd)/.npm:/.npm:z \
		-w /app \
		--env HTTP_PROXY="http://bbpproxy.epfl.ch:80/" \
		--env HTTPS_PROXY="http://bbpproxy.epfl.ch:80/" \
		--entrypoint /bin/sh \
		node:lts  \
			-c "make build_dist"

build_image:
	docker build -t $(APP_NAME) . --platform=linux/amd64

push_image:
	docker tag \
		$(APP_NAME):latest \
		$(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(PROJECT)/$(APP_NAME):$(IMAGE_TAG)
