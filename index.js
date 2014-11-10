'use strict';

var getSlug = require('speakingurl'),
	Puid = require('puid'),
	puid = new Puid(true);

function isBlank(value) {
	return (!value || /^\s*$/.test(value));
}

function pathToSubdocument(path, value) {
	var parts = path.split('.'),
		sub = {},
		actual = sub;

	for(var i=0; i<parts.length; i++) {
		var part = parts[i],
			isLast = i === parts.length -1;

		actual = actual[part] = isLast ? value : {};
	}

	return sub;
}

function generatePermalink(doc, sources, maxLength) {
	var permalink = null;

	for(var i=0; i<sources.length; i++) {
		var value = doc.get(sources[i]);
		if(!value || isBlank(value)) {
			continue;
		}

		permalink = value;
		break;
	}

	if(permalink !== null) {
		permalink = getSlug(permalink, {
			truncate: maxLength
		});	
	}

	return permalink;
}

function getNextPermalink(doc, model, path, permalink, separator, cb) {
	var version = '',
		conditions = pathToSubdocument(path, permalink);

	//if there is empty permalink
	if(isBlank(permalink)) {
		return cb(null, puid.generate());
	}

	//check actual permalink
	model.findOne(conditions, function(err, record) {
		if(err) {
			return cb(err);
		}

		if(!record || record._id.equals(doc._id)) {
			return cb(null, permalink);	
		}

		cb(null, permalink + separator + puid.generate());
	});
}

module.exports = function permalinkPlugin (schema, options) {
	//prepare arguments
	options = options || {};

	if(options.sources && typeof options.sources === 'string') {
		options.sources = [options.sources];
	}

	//prepare parameters
	var path = options.path || 'permalink',
		pathOptions = options.pathOptions || {},
		sources = options.sources || ['name'],
		maxLength = options.maxLength || 50,
		separator = options.separator || '-';

	//prepare path options;
	pathOptions.type = String;
	pathOptions.trim = true;
	pathOptions.unique = true;
	pathOptions.required = true;
	
	//prepare schema
	schema.path(path, pathOptions);

	schema.pre('validate', function (next) {
		var _this = this,
			modelName = options.modelName || this.constructor.modelName,
			model = this.model(modelName),
			actualValue = this.get(path);

		if(actualValue && !this.isNew && !this.isModified(path)) {
			return next();
		} 

		var permalink = actualValue || generatePermalink(this, sources, maxLength);

		getNextPermalink(this, model, path, permalink, separator, function(err, permalink) {
			if(err) {
				return next(err);
			}

			_this.set(path, permalink);
			next();
		});
	});
};