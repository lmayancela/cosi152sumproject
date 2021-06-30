const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const layouts = require("express-ejs-layouts");
// const auth = require('./config/auth.js');

const mongoose = require('mongoose');
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect('mongodb://localhost/authDemo');
//const mongoDB_URI = process.env.MONGODB_URI
//mongoose.connect(mongoDB_URI)



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("we are connected!!!")
});

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn
const loggingRouter = require('./routes/logging');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const profileRouter = require('./routes/profile');

const Reminder = require('./models/Reminder');
const User = require('./models/User');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter)
app.use(loggingRouter);
app.use('/', indexRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);


app.get('/reminderForm',
  isLoggedIn,
  (req, res) => {
    res.render('reminderForm')
  })

const sendMail = require('./functions/sendMail')

app.post('/postReminder',
  isLoggedIn,
  async (req, res, next) => {
    if (req.body.channel = "Email") {
      sendMail(req.user, req.body);
    }
    const reminder = new Reminder(
      {
        name: req.body.name,
        time: req.body.time,
        task: req.body.task,
        channel: req.body.channel,
        notes: req.body.notes,
        userId: req.user._id
      })
    await reminder.save();
    res.redirect('/reminderList')
  });

app.get('/reminderList',
  isLoggedIn,
  async (req, res, next) => {
    res.locals.reminders = await Reminder.find({ userId: req.user._id })
    res.locals.count = 1
    res.render('reminderList');
  });

app.get('/updateReminder/:id',
  isLoggedIn,
  async (req, res, next) => {
    var id = req.params.id;
    res.locals.reminder = await Reminder.findOne({ _id: id })
    res.render('reminderEditPage');
  });

app.post('/updateReminder/:id',
  isLoggedIn,
  async (req, res, next) => {
    var id = req.params.id;
    Reminder.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          task: req.body.task,
          time: req.body.time,
          notes: req.body.notes,
          channel: req.body.channel,
        }
      },
      function (err, result) {
        if (err) throw err;
      }
    );
    res.redirect('/reminderList');
  });

app.post('/deleteReminder/:id',
  isLoggedIn,
  async (req, res, next) => {
    var id = req.params.id;
    Reminder.deleteOne(
      { _id: id },
      function (err, result) {
        if (err) throw err;
      }
    );
    res.redirect('/reminderList');
  });

app.get('/profiles',
  isLoggedIn,
  async (req, res, next) => {
    try {
      res.locals.profiles = await User.find({})
      res.render('profiles')
    }
    catch (e) {
      next(e)
    }
  }
)

app.use('/publicprofile/:userId',
  async (req, res, next) => {
    try {
      let userId = req.params.userId
      res.locals.profile = await User.findOne({ _id: userId })
      res.render('publicprofile')
    }
    catch (e) {
      console.log("Error in /profile/userId:")
      next(e)
    }
  }
)

app.use('/data', (req, res) => {
  res.json([{ a: 1, b: 2 }, { a: 5, b: 3 }]);
})

//const User = require('./models/User');

app.get("/test", async (req, res, next) => {
  try {
    const u = await User.find({})
    console.log("found u " + u)
  } catch (e) {
    next(e)
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
