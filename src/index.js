import getSlug from 'speakingurl';
import Puid from 'puid';
import extend from 'node.extend';
import keymirror from 'keymirror';

const puid = new Puid(true);

export const Operation = keymirror({
	GRAB_FIRST: null,
	CONCAT: null
});

function isBlank(value) {
	return (!value || /^\s*$/.test(value));
}

function generatePermalink(doc, sources, operation, slugOptions) {
	var permalink = null;

	if(operation === Operation.GRAB_FIRST) {
		for(var i=0; i<sources.length; i++) {
			var value = doc.get(sources[i]);
			if(isBlank(value)) {
				continue;
			}

			permalink = value;
			break;
		}
	} else if(operation === Operation.CONCAT) {
		var list = [];
		sources.forEach(function(source) {
			var value = doc.get(source);
			if(!value || !value.length) {
				return;
			}

			list.push(value);
		});

		if(list.length) {
			permalink = list.join(slugOptions.separator);
		}
	}

	if(permalink !== null) {
		permalink = getSlug(permalink, slugOptions);	
	}

	return permalink;
}

function getNextPermalink(doc, model, path, permalink, separator, cb) {
	//if there is empty permalink
	if(isBlank(permalink)) {
		return cb(null, puid.generate());
	}

	//check actual permalink
	model.findOne({
		[path]: permalink
	}, function(err, record) {
		if(err) {
			return cb(err);
		}

		if(!record || record._id.equals(doc._id)) {
			return cb(null, permalink);	
		}

		cb(null, permalink + separator + puid.generate());
	});
}

export default function permalinkPlugin (schema, options) {
	options = options || {};

	if(options.sources && typeof options.sources === 'string') {
		options.sources = [options.sources];
	}

	var slug = options.slug || {};

	//prepare parameters
	var path        = options.path || 'permalink';
	var pathOptions = options.pathOptions || {};
	var sources     = options.sources || ['name'];
	var operation   = options.operation || Operation.GRAB_FIRST;
	var slugOptions = extend({}, slug, {
		separator : slug.separator || '-',
		truncate  : slug.truncate  || 50
	});

	//prepare path options;
	pathOptions.type = String;
	pathOptions.trim = true;
	pathOptions.unique = true;
	pathOptions.required = true;
	
	//prepare schema
	schema.path(path, pathOptions);

	schema.pre('validate', function (next) {
		var modelName = options.modelName || this.constructor.modelName;
		var model = this.model(modelName);
		var actualValue = this.get(path);

		if(actualValue && !this.isNew && !this.isModified(path)) {
			return next();
		} 

		var permalink = actualValue || generatePermalink(this, sources, operation, slugOptions);

		getNextPermalink(this, model, path, permalink, slugOptions.separator, (err, permalink) => {
			if(err) {
				return next(err);
			}

			this.set(path, permalink);
			next();
		});
	});
};