const fs = require('fs');
const path = require('path');
const users = JSON.parse(fs.readFileSync('./json-resources/users.json'));
const helperAPI = require('../modules/helperAPI');
const driveAPI = require('../modules/driveAPI');
const firebaseAPI = require('../modules/firebaseAPI');
const redirectAPI = require('../modules/redirectAPI');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
var FormData = require('form-data');

const User = require('../models/mongo/User');
const Log = require('../models/mongo/Log');
const Server = require('../models/mongo/Server');
const Video = require('../models/mongo/Video');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);

const axios = require('axios');
const VideoStatus = require('../models/mongo/VideoStatus');

exports.AllVideoOnServer = catchAsync(async (req, res, next) => {
  const servers = await Server.find({}, null, { lean: 'toObject' }).populate('videos');
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found any servers',
    });
    return;
  }
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    for (let y = 0; y < server.videos.length; y++) {
      const video = server.videos[y];
      const videoStatus = await VideoStatus.findOne({ video: video._id, server: server._id }).select(
        'status videoDuration encodeDuration _id'
      );
      video.videoStatus = videoStatus;
    }
  }
  res.status(200).json({
    servers,
  });
});
