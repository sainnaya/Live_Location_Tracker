
 // mongodb+srv://sain0110_db_user:07gWnIM5nu5BNF40@cluster0.qgqrxpr.mongodb.net/
  
 module.exports = {

    port: process.env.PORT || 6060,

    username: process.env.USERNAME || "admin",

    password: process.env.PASSWORD || "123456",

    token: process.env.TOKEN || "abcdefghijklmnopqrstuvwxyz",

    mongoURI: process.env.MONGODB_URI || "mongodb+srv://sain0110_db_user:07gWnIM5nu5BNF40@cluster0.qgqrxpr.mongodb.net/?appName=Cluster0"


};