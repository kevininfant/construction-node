require("dotenv").config();
module.exports = {
    development : {
        username :process.env.DB_USERNAME,
        password: '#w2p7U@*#sePYyT',
        database: process.env.DB_DATABASE,
        host :process.env.DB_HOST,
        dialect:'mysql',
    },
};
