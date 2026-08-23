
  
module.exports = {
    port: process.env.PORT || 6060,

    username: process.env.APP_USERNAME,
    password: process.env.APP_PASSWORD,
    token: process.env.APP_TOKEN,

    mongoURI: process.env.MONGODB_URI
};
