module.exports = function (app, rootRef) {
  app.get('/*',function(req, res) {
    res.sendFile("index.html",{root:'./public'});
  });
};


