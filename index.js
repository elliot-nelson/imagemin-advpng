'use strict';

var advpng = require('advpng-bin').path;
var ExecBuffer = require('exec-buffer');
var isPng = require('is-png');
var through = require('through2');

/**
 * advpng imagemin plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new Error('Streaming is not supported'));
			return;
		}

		if (!isPng(file.contents)) {
			cb(null, file);
			return;
		}

		var exec = new ExecBuffer();
		var args = ['--recompress', '-q'];
		var optimizationLevel = opts.optimizationLevel || 3;

		if (typeof optimizationLevel === 'number') {
			args.push('-' + optimizationLevel);
		}

		exec
			.dest(exec.src())
			.use(advpng, args.concat([exec.src()]))
			.run(file.contents, function (err, buf) {
				if (err) {
					cb(err);
					return;
				}

				file.contents = buf;
				cb(null, file);
			});
	});
};
