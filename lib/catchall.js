'use strict';

const
	{ Router } = require('express'),
	merge = require('merge'),
	flatten = require('array-flatten'),
	methods = require('methods');

module.exports = exports = (handlerRoute) => {

	// We add a special catch all route that allows to catch unallowed methods.
	Router.catchAll = function(...args) {

		let path = '/';

		if (args.length > 0 && typeof args[0] === 'string') {
			path = args[0];
			args = args.slice(1);
		}

		if (handlerRoute) args.push(handlerRoute);

		// Get all methods from the route stack that matches our path.
		const routeMethods = merge(...this.stack.filter((layer) => {
			return (layer.route || {}).path == path;
		}).map((layer) => {
			return layer.route.methods;
		}));

		// Put together the `Allow` header.
		const allowed = flatten(Object.keys(routeMethods)
			.filter((method) => {
				return methods.indexOf(method) > -1;
			})
			.map((method) => {
				if (method === 'get') return ['GET', 'HEAD'];
				return [method.toUpperCase()];
			})).concat(['OPTIONS']);
		
		// Add `all` route.
		return this.all(path, (req, res, next) => {

			// Set `Allow` header.
			res.setHeader('Allow', allowed.join(', '));

			if (!handlerRoute) {
				res.status(405);
				return next();
			}

			res.sendStatus(405);

		}, ...args);

	};

};