const express = require('express');
const fs = require('fs');
const historyApiFallback = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
// const morgan = require('morgan')

const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';
const config = isDev?require('../config/config'):'';

const port  = process.env.PORT || 8080;
const passport = require('passport')
const session = require('express-session')

const {ensureAuthenticated} = require('./routes/api/auth')
const app = express();

const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);


// Configuration
// ================================================================================================

// Set up Mongoose
// mongoose.connect(isDev ? config.db : process.env.MONGO_URI,{useNewUrlParser: true,useUnifiedTopology: true});
// mongoose.Promise = global.Promise;


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(isDev ? config.db_dev : process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    mongoose.Promise = global.Promise;


    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

connectDB();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());





var idk  = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // store: new MongoStore({ mongooseConnection: mongoose.connection }),
})

app.use(idk);

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())



// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(idk));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    console.log('error check')
    next(new Error('unauthorized'))
  }
});

app.use('/SignIn', require('./routes/api/SignIn'))
app.use('/SignUp', require('./routes/api/SignUp'))
app.use('/dashboard',ensureAuthenticated, require('./routes/api/dashboard'))
app.use('/game',ensureAuthenticated, require('./routes/api/game'))

require('./routes/api/socket')(io);

if (isDev) {
  const compiler = webpack(webpackConfig);

  // app.use(morgan('dev'))


  app.use(historyApiFallback({
    verbose: false
  }));

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(__dirname, '../client/public'),
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  }));

  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    res.end();
  });
}

server.listen(process.env.PORT || 8080, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }
  console.log(port)
  console.info('>>> 🌎 Open http://0.0.0.0:%s/ in your browser.', port);
});

module.exports = app;
