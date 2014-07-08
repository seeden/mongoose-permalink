'use strict';

var getSlug = require('speakingurl');
var Puid = require('puid');

var puid = new Puid(true);

function isBlank(value) {
	return (!value || /^\s*$/.test(value));
}

function generatePermalink(doc, sources, maxLength) {
	var permalink = null;

	for(var i=0; i<sources.length; i++) {
		var value = doc[sources[i]];

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

function getNextPermalink(doc, model, target, permalink, separator, cb) {
	var version = '';
	var conditions = {};

	//if there is empty permalink
	if(isBlank(permalink)) {
		return cb(null, puid.generate());
	}

	//check actual permalink
	conditions[target] = permalink;
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
	if(!options) {
		options = {};
	}

	if(options.sources && typeof options.sources === 'string') {
		options.sources = [options.sources];
	}

	//prepare parameters
	var target = options.target || 'permalink';
	var sources = options.sources || ['name'];
	var maxLength = options.maxLength || 50;
	var separator = options.separator || '-';
	
	//prepare schema
	var schemaData = {};
	schemaData[target] = { type: String, unique: true, required: true };

	schema.add(schemaData);
	schema.pre('validate', function (next) {
		var self = this;

		var modelName = options.modelName || this.constructor.modelName;
		var model = this.model(modelName);

		if(this[target] && !this.isNew && !this.isModified(target)) {
			return next();
		} 

		var permalink = this[target] || generatePermalink(this, sources, maxLength);

		getNextPermalink(this, model, target, permalink, separator, function(err, permalink) {
			if(err) {
				return next(err);
			}

			self[target] = permalink;
			next();
		});
	});
};