Mongoose permalink
==================

Create automatically slug permalink in your mongoose models

## Motivation

There is several plugins with very similar functionality. But I have these conditions:
 * create permalink(slug) from existing keys of a document (one key or list of keys)
 * check existance of permalink in one simple query (few plugins are selected all documents started with value of permalink or in worse case checked existence in multiple cycles)
 * we can not override save method and catch duplicate error
 * when permalink exists we add unique suffix (unique depending on time, machine and process for use in a distributed environment, relatively short compared to a mongoose's ObjectId (14 characters))
 * permalink is always required, unique and indexed

## Install

	$ npm install mongoose-permalink

## Options

Plugin has several optional parameters:
 * target - Name of key in a schema (default: 'permalink')
 * sources - List of keys of a document from which is the permalink computed (default: 'name')
 * maxLength - Max length of permalink (default: 50)
 * separator - Separator is used when slag already exists (default: '-')

## Usage

	var mongoose = require('mongoose');
	var permalink = require('mongoose-permalink');

	var userSchema = new Schema({
		name     : { type: String },
		username : { type: String }
	});


	userSchema.plugin(permalink, {
		sources: ['name', 'username']
	});


	var User = mongoose.model('User', userSchema);

	var user = new User({
		name: 'Peter'
	});

	user.save(function(err, user) {
		console.log(user.permalink); // => peter
	});

	//if permalink already exists unique ID will be added
	var user2 = new User({
		name: 'Peter'
	});

	user2.save(function(err, user) {
		console.log(user.permalink); // => peter-3bqk9my9buecut
	});
