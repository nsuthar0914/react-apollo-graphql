'use strict';
const storage = require('@google-cloud/storage');
const fs = require('fs')

const gcs = storage({
  projectId: 'apollo-testing',
  keyFilename: __dirname + '/../static/apollo-testing-fa2cc17cc383.json'
});

const bucketName = 'apollo-static'
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
}

let ImgUpload = {};

ImgUpload.uploadToGcs = (req, res, next) => {
  // console.log(req.file);
  if(!req.file) return next();

  // Can optionally add a path to the gcsname below by concatenating it before the filename
  const gcsname = req.file.originalname;
  const file = bucket.file(gcsname);
  // console.log('file', file)
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });
  // console.log('stream', stream);
  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    // console.log(req.file)
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    // console.log(req.file)
    next();
  });

  stream.end(req.file.buffer);
}

module.exports = ImgUpload;