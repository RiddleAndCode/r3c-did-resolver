show-todo:
	git grep -n TODO

check:
	for i in test/test-*.js; do node "$$i"; done
