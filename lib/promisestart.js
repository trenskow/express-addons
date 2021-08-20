'use strict';

const
	{ application } = require('express');

exports = module.exports = () => {

	if (application.isPromiseStartInstalled) return;

	Object.defineProperty(application, 'isPromiseStartInstalled', {
		value: true,
		enumerable: true,
		writable: false
	});

	application.start = function(port) {
		return new Promise((resolve, reject) => {
			const server = this.listen(port, () => resolve(server)).on('error', reject);
		});
	};

};
