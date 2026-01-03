require('dotenv').config();
const mysql=require('mysql2');
const pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:process.env.PASSWORD,
    database:'Airbnb',
});
module.exports=pool.promise();