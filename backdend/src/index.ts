import pool from "./db.js";

const [rows] = await pool.query("SELECT 1");
console.log("MySQL connected:", rows);
