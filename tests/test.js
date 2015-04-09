import should from "should";
import mongoose, { Schema } from 'mongoose';
import request from 'supertest';
import permalink, { Operation } from '../src/index';

var connection = null;

describe('Test', function() {
	var User = null;

	it('should be able to connect to db', function(done) {
		connection = mongoose.connect('mongodb://localhost/mongoose-permalink');
		done();
	});

	it('should be able to create a model', function(done) {
		var schema = new Schema({
			name     : { type: String },
			username : { type: String }
		});

		schema.plugin(permalink, {
			sources: ['name', 'username'],
			slug: {
				truncate: 10
			}
		});

		User = connection.model('User', schema);
		done();
	});

	it('should be able to empty User table', function(done) {
		User.remove({}, function(err){
			if(err) {
				throw err;
			}

			done();
		});
	});	

	it('should be able to create a user', function(done) {
		var user = new User({
			name: 'Zlatko'
		});

		user.save(function(err, user) {
			if(err) {
				throw err;
			}

			user.permalink.should.equal('zlatko');
			done();
		});
	});	

	it('should be able to create a second user', function(done) {
		var user = new User({
			name: 'Zlatko'
		});

		user.save(function(err, user) {
			if(err) {
				throw err;
			}

			user.permalink.should.not.equal('zlatko');
			done();
		});
	});	

	it('should be able to create a shorter permalink', function(done) {
		var user = new User({
			name: 'Peter Zlatko Fedor'
		});

		user.save(function(err, user) {
			if(err) {
				throw err;
			}

			user.permalink.should.equal('peter');
			done();
		});
	});	
});	

describe('Test concat', function() {
	var User = null;

	it('should be able to create a model', function(done) {
		var schema = new Schema({
			name     : { type: String },
			username : { type: String }
		});

		schema.plugin(permalink, {
			sources: ['name', 'username'],
			operation: Operation.CONCAT
		});

		User = connection.model('User2', schema);
		done();
	});

	it('should be able to empty User table', function(done) {
		User.remove({}, function(err){
			if(err) {
				throw err;
			}

			done();
		});
	});	

	it('should be able to create a user', function(done) {
		var user = new User({
			name: 'Zlatko',
			username: 'zlatik'
		});

		user.save(function(err, user) {
			if(err) {
				throw err;
			}

			user.permalink.should.equal('zlatko-zlatik');
			done();
		});
	});	

	it('should be able to create a second user', function(done) {
		var user = new User({
			name: 'Zlatko'
		});

		user.save(function(err, user) {
			if(err) {
				throw err;
			}

			user.permalink.should.equal('zlatko');
			done();
		});
	});
});	
