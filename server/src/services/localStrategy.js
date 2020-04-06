import passport from 'passport';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import Joi from 'joi';

import User from '../models/User';
import { loginSchema } from './validators';

const passportLogin = new PassportLocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    const { error } = Joi.validate(req.body, loginSchema);
    if (error) {
      return done(null, false, { message: error.details[0].message });
    }

    try {
      const user = await User.findOne({ email: email.trim() });
      if (!user) {
        return done(null, false, { message: 'Email does not exists.' });
      }

      user.comparePassword(password, function (err, isMatch) {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  },
);

passport.use(passportLogin);
