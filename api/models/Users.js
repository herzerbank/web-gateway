/* 
 * Users Model
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: String,
  name: String,
  emailVerified: {type: Boolean, default: false},
  file: String,
  fileVerified: {type: Boolean, default: false},
  birthdate: Date,
  street: String,
  aptNumber: String,
  zip: String,
  city: String,
  hash: String,
  salt: String,
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  return jwt.sign({id: this._id, email: this.email},
  'tT6YAJB70cMBDRrlPvgl8W2I+DFA06ULjrZnpob9y5M=',
    {
        expiresIn: "12h"
    });
}

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

mongoose.model('Users', UsersSchema);
