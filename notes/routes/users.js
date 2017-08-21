'use strict';

const path = require('path');
const util = require('util');
const log = require('debug')('note-app:router-users');
const error = require('debug')('note-app:error');
const express = require('express');
const router = express.Router();
exports.router = router;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy;

const usersModel = require(process.env.USERS_MODEL
    ? path.join('..', process.env.USERS_MODEL)
    : '../models/users-rest');


exports.initPassport = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
};

exports.ensureAuthenticated = function(req, res, next) {
    if (req.user) next();
    else res.redirect('/users/login');
};

router.get('/login', function(req, res, next) {
    // log(util.inspect(req));
    res.render('login', {
        title: 'Login to Notes',
        user: req.user
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/', // Success: Go to home page
        failureRedirect: '/users/login', // Fail: Got to /user/login
    })
);

router.get('/logout', function(req, res, next) {
    req.session.destroy(function (err) {
        if (err) next(err);
        else res.redirect('/');
    });
});

router.get('/login/twitter', passport.authenticate('twitter'));

router.get('/login/twitter/callback',
    passport.authenticate('twitter', {failureRedirect: '/users/login'}),
    function(req, res) {
    res.redirect('/');
});

passport.use(new LocalStrategy(
  function(username, passport, done) {
      usersModel.userPasswordCheck(username, passport)
        .then(check => {
            if (check.check) {
                done(null, {id: check.username,
                username: check.username});
            } else {
                done(null, false, check.message);
            }
            return check;
        })
        .catch(err => done(err));
  }
));


// TODO Get callback URL dynamicly

passport.use(new TwitterStrategy({
    consumerKey: 'ygrqv9xwuADLkJ75G5htRlQYN',
    consumerSecret: 'BPhIzb75arqZ6zvESjD4pbuGJjzSbP7Qg0rmeST6srsMGCLMTy',
    callbackURL: `http://159.203.87.52:3000/users/login/twitter/callback`
}, function(token, tokenSecret, profile, done) {
    if (profile && profile.id) {
        usersModel.findOrCreate({
            id: profile.username,
            password: '',
            provider: profile.provider,
            familyName: profile.displayName,
            givenName: '',
            middleName: '',
            photos: profile.photos,
            emails: profile.emails
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    }
    else {
        done(null, false, 'Profile id is not defined');
    }
}));

passport.serializeUser(function(user, done) {
    log(util.inspect(user));
    if (!user) {
        error(`Can't serialize user to the session`);
        done(new Error(`Trying to serialize undefined user to session`));
        return;
    }
    done(null, user.username || user.id)
});

passport.deserializeUser(function(username, done) {
    usersModel.find(username)
      .then(user => done(null, user))
      .catch(err => done(err));
});