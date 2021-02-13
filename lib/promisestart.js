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
			this.listen(port, () => resolve(port)).on('error', reject);
		});
	};

};
