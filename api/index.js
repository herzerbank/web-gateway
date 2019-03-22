/* 
 * API to Herzerbank for handling user data and sessions
 */

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const auth = require('./auth');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const session = require('express-session');



const router = express.Router();

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Base Config
router.use(cors());
router.use(require('morgan')('dev'));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, 'public')));
router.use(session({ secret: 'tT6YAJB70cMBDRrlPvgl8W2I+DFA06ULjrZnpob9y5M=', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  router.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost/herzerbank');
mongoose.set('debug', true);

//Models & routes
require('./models/Users');
require('./config/passport');



//Error handlers & middlewares
if(!isProduction) {
  router.use((req, res, next, err) => {

    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

const Users = mongoose.model('Users');

// GET http://localhost:8080/api
router.get('/', auth.optional, function(req, res, next) {
    return res.json({ message: 'hooray! welcome to our api!' });   
});

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const { body: { user } } = req;
  const errors = {};
  let errOccurred = false;
  
  if(!user.email) {
    errOccurred = true;
    errors.email = 'is required';
  }

  if(!user.password) {
    errOccurred = true;
    errors.password = 'is required';
  }
  
  if(!user.name) {
    errOccurred = true;
    errors.name = 'is required';
  }
  
  if(!user.street) {
    errOccurred = true;
    errors.street = 'is required';
  }
  
  if(!user.aptNumber) {
    errOccurred = true;
    errors.aptNumber = 'is required';
  }
  
  if(!user.zip) {
    errOccurred = true;
    errors.zip = 'is required';
  }
  
  if(!user.city) {
    errOccurred = true;
    errors.city = 'is required';
  }

  
  if(!user.name) {
    errOccurred = true;
    errors.name = 'is required';
  }
  
  if(!user.birthday) {
    errOccurred = true;
    errors.birthday = 'is required';
  }
  
  if(!user.phone) {
    errOccurred = true;
    errors.phone = 'is required';
  }
  
  if(errOccurred){
    return res.status(422).json({
      "errors": errors,
    });
  }
  else{
  
    const email = user.email;
    Users.findOne({ email })
      .then((u) => {
        if(!u){
          const finalUser = new Users(user);
            finalUser.setPassword(user.password);
            return finalUser.save()
              .then(() => res.json({ user: finalUser.toAuthJSON() }));
        }
        if(!u.file) {
          u.remove(() => {
            const finalUser = new Users(user);
            finalUser.setPassword(user.password);
            return finalUser.save()
              .then(() => res.json({ user: finalUser.toAuthJSON() }));
          });
        }
        else{
          return res.status(422).json({
            errors: {
              email: 'already in use',
            },
          });
        }



      }).catch(err => {return res.status(422).json({
          errors: err,
        })});
  }
  
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return res.json({ "errors": err });
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return res.json({ "errors": "notFound" });
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  
  if(req.user && req.user.id && req.user.exp && req.user.exp < new Date().getTime()){
    return Users.findById(req.user.id)
      .then((user) => {
        if(!user) {
          return res.json({ "errors": 'NoSession' });
        }

        return res.json({ "user": user.toAuthJSON() });
      });
    }
    else {
      return res.json({ "errors": 'NoSession' });
    }
});


module.exports = router;