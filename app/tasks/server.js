exports.server = (connect) => {

  function server(cb) {
    const connectServer = connect.server({
      root: './src/',
      livereload: true,
      host: '0.0.0.0',
    });

    connectServer.server.on('listening', cb);
  }

  return server;
};