var development = {
  firebase: {
    rootRefUrl: "https://answers-table.firebaseio.com/",
    serverUID: "answers-table",
    secretKey: "QI38kcnAhnFQJeRciZajOoRzTPBfSbCn2t1pmT3x"
  }
};

var test = {
  firebase: {
    rootRefUrl: "",
    serverUID: "answers-table",
    secretKey: ""
  }
};

var production = {
  firebase: {
    rootRefUrl: process.env.FB_URL,
    serverUID: process.env.FB_SERVER_UID,
    secretKey: process.env.FB_SECRET_KEY
  }
};

var config = {
  development: development,
  test: test,
  production: production,
};
module.exports = config;
