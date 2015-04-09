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

```sh
npm install mongoose-permalink
```

## Options

Plugin has several optional parameters:
 * path - Name of key in a schema (default 'permalink')
 * sources - List of keys of a document from which is the permalink computed (default 'name')
 * operation 
 	- GRAB_FIRST - will use first non blank value (default 'GRAB_FIRST') 
 	- CONCAT - will concat all non blank values
 * slug - additional options from plugin [speakingurl](https://www.npmjs.com/package/speakingurl) 
 	- separator - char that replace the whitespaces (default '-')
 	- truncate - trim to max length while not breaking any words (default 50)
 	- ... 

## Usage

```js
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
	name: 'Zlatko'
});

user.save(function(err, user) {
	console.log(user.permalink); // => zlatko
});

//if permalink already exists unique ID will be added
var user2 = new User({
	name: 'Zlatko'
});

user2.save(function(err, user) {
	console.log(user.permalink); // => zlatko-3bqk9my9buecut
});
```


## License

The MIT License (MIT)

Copyright (c) 2015 Zlatko Fedor zlatkofedor@cherrysro.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
