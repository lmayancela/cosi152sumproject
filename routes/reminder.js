const express = require('express');
const router = express.Router();
const sendMail = require('../functions/sendMail')
const authRouter = require('./authentication');
const isLoggedIn = authRouter.isLoggedIn

const Reminder = require('../models/Reminder');

router.get('/create',
  isLoggedIn,
  (req, res) => {
    res.render('reminderForm')
  })

router.post('/create',
  isLoggedIn,
  async (req, res, next) => {
    let reqDateTime = new Date(`${req.body.date}T${req.body.time}`)
    const reminder = new Reminder(
      {
        name: req.body.name,
        task: req.body.task,
        time: reqDateTime,
        channel: req.body.channel,
        notes: req.body.notes,
        userId: req.user._id,
      })
      // ! Commented out email sending until I can figure out why I'm getting 400 errors randomly
    // if (req.body.channel = "Email") {
    //   sendMail(req.body, reqDateTime); // What, When
    // }
    await reminder.save();
    res.redirect('/reminder/list')
  });

router.get('/list',
  isLoggedIn,
  async (req, res, next) => {
    res.locals.reminders = await Reminder.find({ userId: req.user._id })
    res.locals.count = 1
    res.render('reminderList');
  });

router.get('/update/:id',
  isLoggedIn,
  async (req, res, next) => {
    try {
      var id = req.params.id;
      const reminder = await Reminder.findOne({ _id: id })
      console.log(`Found reminder: ${JSON.stringify(reminder)}`)
      const timeReg = /[T\.Z]/;
      let utcTime = new Date(reminder.time); // We need to adjust the time offset from UTC before loading
      const offset = new Date().getTimezoneOffset();
      utcTime.setMinutes(utcTime.getMinutes() - offset);
      res.locals.reminder = reminder;
      res.locals.oldTime = {
        date: utcTime.toISOString().split(timeReg)[0],
        time: utcTime.toISOString().split(timeReg)[1],
      }
      res.render('reminderEditPage');
    } catch (e) {
      next(e)
    }
  });

router.post('/update/:id',
  isLoggedIn,
  async (req, res, next) => {
    var id = req.params.id;
    let reqDateTime = new Date(`${req.body.date}T${req.body.time}`)
    Reminder.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          task: req.body.task,
          time: reqDateTime,
          channel: req.body.channel,
          notes: req.body.notes,
        }
      },
      function (err, result) {
        if (err) throw err;
      }
    );
    res.redirect('/reminder/list');
  });

router.post('/delete/:id',
  isLoggedIn,
  async (req, res, next) => {
    var id = req.params.id;
    Reminder.deleteOne(
      { _id: id },
      function (err, result) {
        if (err) throw err;
      }
    );
    res.redirect('/reminder/list');
  });

module.exports = router;