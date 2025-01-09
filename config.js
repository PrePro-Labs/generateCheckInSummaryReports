import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "process.env" });

const config = {
  mySQLConfig: {
    connectionLimit: 5,
    host: process.env.MYSQL_CONNECTION_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
  },
};

export const mysqlPool = (async function () {
  try {
    const pool = await mysql.createPool(config.mySQLConfig);

    console.log("Connected to MySQL Database");

    return pool;
  } catch (err) {
    console.log("MySQL Database Connection Failed! Bad Config: ", err);
    throw err;
  }
})();
