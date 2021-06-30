// Profile router
// Context: '/profile/'

const express = require('express');
const router = express.Router();
const isLoggedIn = require('./authentication').isLoggedIn;

router.get('/',
  isLoggedIn,
  (req, res) => {
    res.render('profile')
  })

router.get('/edit',
  isLoggedIn,
  (req, res) => res.render('editProfile'))

router.post('/edit',
  isLoggedIn,
  async (req, res, next) => {
    try {
      let username = req.body.username
      let age = req.body.age
      req.user.username = username
      req.user.age = age
      req.user.imageURL = req.body.imageURL
      await req.user.save()
      res.redirect('/profile')
    } catch (error) {
      next(error)
    }
  })

module.exports = router;