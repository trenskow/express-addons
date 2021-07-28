'use strict';

const
	path = require('path');

const
	{ Router } = require('express'),
	merge = require('merge'),
	stack = require('@trenskow/stack'),
	caseit = require('@trenskow/caseit');

exports = module.exports = (options = {}) => {

	if (Router.isMountInstalled) return;

	Object.defineProperty(Router, 'isMountInstalled', {
		value: true,
		enumerable: true,
		writable: false
	});

	options.casing = options.casing || {};

	options.casing.url = options.casing.url || 'kebab';
	options.casing.fs = options.casing.fs || 'kebab';
	options.casing.params = options.casing.params || 'camel';

	Router.mount = function (routes, opts = {}) {

		const stackLevel = opts.stackLevel || 0;

		if (typeof routes === 'string') return this.mount([routes], { stackLevel: stackLevel + 1 });

		const callerPath = path.dirname(stack()[1 + stackLevel].file);

		if (Array.isArray(routes)) routes = merge(...routes.map((route) => {
			let obj = {};
			let mountPoint = route;
			if (mountPoint.substr(0, 1) === ':') mountPoint = `:${caseit(mountPoint.substr(1), options.casing.params)}`;
			obj[mountPoint] = require(path.join(callerPath, caseit(route, options.casing.fs)));
			return obj;
		}));

		Object.keys(routes).forEach((mountPoint) => {
			this.use(`/${caseit(mountPoint, mountPoint.substr(0, 1) == ':' ? options.casing.params : options.casing.url)}/`, routes[mountPoint]);
		});

		this._available = this._available || [];

		this._available = this._available.concat(Object.keys(routes));

		return this;

	};

	Router.available = function () {
		return this.get((_, res) => {
			res.status(200).json(this._available || []);
		});
	};

};
