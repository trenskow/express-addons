'use strict';

const
	path = require('path');

const
	{ Router } = require('express'),
	merge = require('merge'),
	stack = require('@trenskow/stack'),
	caseit = require('@trenskow/caseit');

exports = module.exports = () => {

	if (Router.isMountInstalled) return;

	Object.defineProperty(Router, 'isMountInstalled', {
		value: true,
		enumerable: true,
		writable: false
	});

	Router.mount = function(routes, options = {}) {

		const stackLevel = options.stackLevel || 0;

		if (typeof routes === 'string') return this.mount([routes], { stackLevel: stackLevel + 1 });

		const callerPath = path.dirname(stack()[1 + stackLevel].file);

		if (Array.isArray(routes)) routes = merge(...routes.map((route) => {
			let obj = {};
			let mountPoint = route;
			if (mountPoint.substr(0, 1) === ':') mountPoint = `:${caseit(mountPoint.substr(1))}`;
			obj[mountPoint] = require(path.join(callerPath, route));
			return obj;
		}));

		Object.keys(routes).forEach((mountPoint) => {
			this.use(`/${mountPoint}/`, routes[mountPoint]);
		});

		this.available = this.available || [];

		this.available = this.available.concat(Object.keys(routes));

		return this;

	};

	Router.available = function() {
		return (_, res) => {
			res.status(200).json(this.available || []);
		};
	};

};
