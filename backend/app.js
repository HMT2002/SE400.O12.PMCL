'use strict';
const express = require('express');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const videoController = require('./controllers/videoController');
const redirectController = require('./controllers/redirectController');

const cors = require('cors');
var path = require('path');
const fs = require('fs');

// const client_posts = JSON.parse(fs.readFileSync('./json-resources/client_posts.json'));

//MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
}
console.log(process.env.NODE_ENV);
app.use(express.json());
// app.use(express.static('public'));

app.use(cors());
app.options('*', cors());
const whitelist = ['http://localhost:9000', 'http://localhost:9100', 'http://localhost:9200', 'http://localhost:9300'];

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS, HEAD, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, X-Api-Key, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Headers, Authorization, index'
  );

  // res.setHeader('Access-Control-Allow-Credentials', 'true');
  // res.setHeader('Access-Control-Allow-Methods', '*');
  // res.setHeader('Access-Control-Allow-Headers', '*');

  // res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


//http://localhost:9000/videos/convert/無意識.m3u8
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  //console.log(req.headers);
  req.url = decodeURIComponent(req.url);

  next();
});

// #region Handling extra requests, such as subtitle requests
app.get('/*.vtt', videoController.VTTHandler);
app.get('/*.ass', videoController.ASSHandler);
app.get('/*.srt', videoController.SRTHandler);
// app.get('/*.mp4', videoController.MP4MPDHandler);
// app.get('/*.mpd', videoController.MPDHandler);
// app.get('/*.m4s', redirectController.M4SHandler);

// #endregion

//ROUTES
const defaultRoute = require('./routes/defaultRoute');
const threadRouter = require('./routes/threadRoute');
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');
const videoRouter = require('./routes/videoRoute');
const testRouter = require('./routes/testRoute');
const redirectRouter = require('./routes/redirectRoute');

//app.use('/', defaultRoute);

app.use('/api/v1/', defaultRoute);
app.use('/api/v1/threads', threadRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

app.use('/api/test', testRouter);
app.use('/api/video', videoRouter);
app.use('/redirect', redirectRouter);

app.all('*', (req, res, next) => {
  next(new AppError('Cant find ' + req.originalUrl + ' on the server', 404));
});
app.use(globalErrorHandler);

module.exports = app;
