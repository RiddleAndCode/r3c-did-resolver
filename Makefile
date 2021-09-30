show-tasks:
	git grep -n TODO && git grep -n FIXME

check:
	for i in test/test-*.js; do node "$$i"; done
