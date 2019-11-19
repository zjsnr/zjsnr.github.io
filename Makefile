OUTPUT_PATH := build/

.PHONY:	all

all: build/index.html build/build/index.html

build/index.html: src/app/*.py src/app/templates/*.html
	OUTPUT_PATH=$(OUTPUT_PATH) python3.7 src/app/make.py

build/build/index.html: src/zjsn-vue/public/* src/zjsn-vue/src/* src/zjsn-vue/public/buildRules.json
	cd src/zjsn-vue && npm run build
	mv src/zjsn-vue/build build/build
	rm src/zjsn-vue/public/buildRules.json

src/zjsn-vue/public/buildRules.json: src/threshold_calc/threshold.xlsx src/threshold_calc/main.py
	cd src/threshold_calc && VERIFY=0 python3.7 main.py
	mv src/threshold_calc/rules.json $@

