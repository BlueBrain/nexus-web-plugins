# Nexus Fusion plugins

This project contains Nexus Fusion Plugins that were originally developed for Blue Blrain and a development environment for them.

## Development

Dev environment can be started with:

```bash
$ make run_dev
```

## Build

Build consists of multiple stages:

- build ts sources into js bundles
- create a plugin manifest.json
- build a docker image to serve artifacts mentioned above

Can be started with:

```bash
$ make build_image
```

When calling this target all necessary dependencies will be managed by `make`.

[Makefile](Makefile) also contains targets corresponding to each separate build step.

For testing the plugins from within Fusion locally you can run the first two steps of
the build process above and then serve these files up using express to which you can
point your local Fusion instance at.

```bash
$ make build_dist_and_host
```

## Deployment

When docker image has been built it can be pushed into docker registry by invoking:

```bash
$ make push_image
```

Note that `push_image` target isn't dependent on `build_image`, so it will **push current version**
of the image present.

## Funding & Acknowledgment

The development of this software was supported by funding to the Blue Brain Project, a research center of the École polytechnique fédérale de Lausanne (EPFL), from the Swiss government's ETH Board of the Swiss Federal Institutes of Technology.

Copyright © 2015-2024 Blue Brain Project/EPFL
