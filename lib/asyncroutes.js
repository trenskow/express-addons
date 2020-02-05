'use strict';

const
	{ Router } = require('express'),
	methods = require('methods'),
	flatten = require('array-flatten');

module.exports = exports = () => {

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
				if (arg.constructor.name !== 'AsyncFunction') return arg;

				// - otherwise we wrap it in a traditional route and return that.
				return (req, res, next, ...args) => {
					// Remark next is not forwarded.
					arg.apply(null, [req, res].concat(args))
						.then((data) => {
							if (typeof data !== 'undefined') {
								let autosender = res.autosender || 'json';
								if (typeof autosender === 'string') autosender = res[autosender];
								autosender.call(res, data);
							} else if (!res.headersSent) {
								next();
							}
						})
						.catch((err) => {
							next(err);
						});
				};

			});

			// Apply new arguments to old implementation.
			return old.apply(this, args);

		};

	});
};
