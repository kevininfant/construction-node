require("dotenv").config();
module.exports = {
    development : {
        username :process.env.DB_USERNAME,
        password: '%#Uwj3KQx&ZReY8',
        database: process.env.DB_DATABASE,
        host :process.env.DB_HOST,
        use_env_variable :'',
        dialect:'mysql',
    },
};
