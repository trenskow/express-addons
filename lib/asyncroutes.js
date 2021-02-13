'use strict';

const
	{ Router } = require('express'),
	methods = require('methods'),
	{ flatten } = require('array-flatten');

module.exports = exports = (options = {}) => {

	if (Router.isAsyncRoutesInstalled) return;

	Object.defineProperty(Router, 'isAsyncRoutesInstalled', {
		value: true,
		enumerable: true,
		writable: false
	});

	// We iterate through the router keys.
	methods.concat(['use', 'param', 'route', 'all']).forEach((key) => {

		// Keep the old implementation.
		let old = Router[key];

		// Replace with new.
		Router[key] = function(...args) {

			// Flatten arguments (express does this also).
			args = flatten(args);

			if (methods.includes(key) && typeof args[0] !== 'string') {
				args.splice(0, 0, '/');
			}

			// Map the arguments.
			args = args.map((arg) => {

				// If argument is not an async function - we just return it.
				if (typeof arg !== 'function' || arg.constructor.name !== 'AsyncFunction') return arg;

				// - otherwise we wrap it in a traditional route and return that.
				let route = (...args) => {

					let err;
					let [req, res, next] = args;
					let forward = [req, res];

					if (args.length === 4) {
						[err, req, res, next] = args;
						forward = [err, req, res];
					}

					// Remark next is not forwarded.
					arg.apply(null, forward.concat(args))
						.then((data) => {
							if (typeof data !== 'undefined') {
								let autoSender = res.autoSender || options.autoSender
									|| res.autosender || options.autosender || 'send';
								if (typeof autoSender === 'string') autoSender = res[autoSender];
								return autoSender.call(res, data, req, res);
							}
						})
						.then(() => {
							if (!res.headersSent) {
								next();
							}
						})
						.catch((err) => {
							next(err);
						});

				};

				Object.defineProperty(route, 'length', { value: arg.length + 1 });

				return route;

			});

			// Apply new arguments to old implementation.
			return old.apply(this, args);

		};

	});
};
