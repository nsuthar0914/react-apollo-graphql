require('babel-core/register');
require("babel-polyfill");
var express = require('express');
var cors = require('cors')
var graphql = require('graphql');
var expressGraphql = require('express-graphql');
var webpack = require('webpack');
var http = require('http');
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var Schema = require('./server/schema.js').default;
var jwtSecret = require('./constants.js').jwtSecret;
var jwt = require('express-jwt');
var Multer = require('multer');
var uploadToStorage = require('./server/upload.js');
var publicPath = path.resolve(__dirname, 'public');

var host = 'http://localhost';
var port = '3000';
var client_host = 'http://localhost';
var client_port = '4000';
var domain_name = 'http://example.com';

process.argv.forEach(function (val, index, array) {
  var values = val.split('=');
  if (values[0] == 'host') {
    host = values[1];
  }
  if (values[0] == 'port') {
    port = values[1];
  }
  if (values[0] == 'client_host') {
    client_host = values[1];
  }
  if (values[0] == 'client_port') {
    client_port = values[1];
  }
  if (values[0] == 'domain_name') {
    domain_name = values[1];
  }
});




// client
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
global.__SERVERHOST__ = host;
global.__SERVERPORT__ = port;

var app = express();
if (__DEVELOPMENT__) {
  var config = require('./webpack.config');
  var compiler = webpack(config);
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
} else {
  var child_process = require('child_process');
  var env = Object.create( process.env );
  env.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
  env.host = host;
  env.port = port;
  child_process.exec("./node_modules/webpack/bin/webpack.js --config webpack.prod.config.js", {
    env: env
  }, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
app.get('*.js', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});
app.use(express.static(publicPath));
const index = fs.readFileSync('./index.html', {
  encoding: 'utf-8'
});
const str = index;
app.get('*', function(req, res) {
  res.status(200).send(str);
});
app.listen(client_port, function () {
  console.log('Client running on port ' + client_port);
});







// server
var corsOptions = {
  origin: `${domain_name}`
}

if (__DEVELOPMENT__) {
  corsOptions.origin = '*';
}

var multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
});

var server = express();

server.locals.server = `${host}:${port}`
server.locals.client = `${domain_name}`

server.use(cors(corsOptions));

server.use(jwt({
  secret: jwtSecret,
  credentialsRequired: false,
  userProperty: 'user',
}));

// server.use(express.static(path.join(__dirname, 'public')));

server.get('/download/:type/:file', function(req, res){
  var filename = Buffer.from(req.params.file, 'base64').toString();
  var fileDir = path.join(__dirname, '/uploads');
  var filePath = path.join(fileDir, filename);
  if (req.params.type === 'attachment') {
    res.download(filePath, filename);
  } else if (req.params.type === 'inline') {
    res.sendFile(filePath);
  }
});

server.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();
  var uploaded;
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  var newFileName = function(file) {
    return path.join(form.uploadDir, file.name);
  }

  var fileUrl = function(file) {
    return `${host}:${port}/uploads/${file.name}`;
  }

  form.on('file', function(field, file) {
    uploaded = Buffer.from(file.name).toString('base64');
    fs.rename(file.path, newFileName(file));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function(success) {
    res.json({
      data: {
        url: uploaded,
      },
    });
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

// server.use('/graphql', multer.single('file'), uploadToStorage.uploadToGcs);

server.use('/graphql', expressGraphql((req) => ({
  schema: Schema,
  rootValue: req,
  graphiql: true
})));

server.listen(port);
console.log(`GraphQL started on  ${host}:${port}`); 
