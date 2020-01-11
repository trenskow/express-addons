'use strict';

const
	path = require('path'),
	semver = require('semver');

const expressPackageJson = path.parse(require.resolve('express')).dir + path.sep + 'package.json';

if (!semver.satisfies(require(expressPackageJson).version, 'v4')) {
	throw new Error('This package only works with express 4.');
}

module.exports = exports = {};

exports.async = require('./lib/asyncroutes');
exports.catchAll = require('./lib/catchall');
