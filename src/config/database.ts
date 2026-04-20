import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// creamos la conexion a base de datos
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'escuela_prueba',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


//hacemos la conexion
export const connectDB = async()=>{
    try {
        const connection = await  pool.getConnection();
        console.log('Conexión exitosa a MySQL');
        connection.release();
        
    } catch (error) {
        console.error('Error al conectar a MySQL:', error);
        process.exit(1);
    
        
    }
};