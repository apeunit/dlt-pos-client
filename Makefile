# build output folder
OUTPUTFOLDER = dist
# docker image
DOCKER_REGISTRY = eu.gcr.io/aeternity-token-burn-listener/pos
DOCKER_IMAGE = customer
K8S_DEPLOYMENT = customer
K8S_NAMESPACE = pos
DOCKER_TAG = $(shell git describe --always)
# build paramters
OS = linux
ARCH = amd64
# k8s parameters


.PHONY: list
list:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | xargs


lint: lint-all

lint-all:
	flake8

clean:
	@echo remove $(OUTPUTFOLDER) folder
	@rm -rf dist
	@echo done

docker-build:
	@echo build image
	npm run build
	docker build -t $(DOCKER_IMAGE) -f Dockerfile .
	@echo done

docker-push:
	@echo push image
	docker tag $(DOCKER_IMAGE) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo  $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo done

deploy-k8s:
	@echo deploy k8s
	kubectl -n $(K8S_NAMESPACE)  patch deployment $(K8S_DEPLOYMENT) --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"$(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)"}]'
	@echo deploy k8s done


docker-run: 
	@docker run -p 5000:5000 $(DOCKER_IMAGE) 

debug-start:
	. .envrc
	python3 faucet.py start
