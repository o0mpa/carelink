import mysql from'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// console.log("DB ENV:", {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS ? "***" : "MISSING",
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT
// });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect(error => {
    if (error) {
        console.error('database connection failed:', error.stack);
        return;
    }
    console.log('connected to MySQL');
});

export default db;