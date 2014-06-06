
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		test/*.js

.PHONY: test