require("dotenv").config();
const mysql = require("knex")({
  client: "mysql",
  connection: {
    host: process.env.HOST_IP,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dateStrings: true,
  },
  pool: { min: 0, max: 7 },
});

module.exports = mysql;
