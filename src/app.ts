import express from "express"
import path from 'path'
import dotenv from 'dotenv';
import routes from './routes/routes'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDB} from './config/database';
import { authMiddleware, roleMiddleware } from './middleware/authMiddleware';



dotenv.config();


const app = express()

const PORT: number= Number(process.env.PORT);
const HOST:string ='0.0.0.0';


// Middlewares
app.use(cors({ origin: true, credentials: true })); //acepta peticiones
app.use(express.json()); //pone el objeto en req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());//permite leer cookis



//archivos estaticos
app.use(express.static(path.join(__dirname,'public')))


//ruta publica
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'login.html'))

});

//ruta privada

app.get('/director', authMiddleware, roleMiddleware('director'), (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'director', 'dashboard.html'));
});


app.get('/maestro',authMiddleware, roleMiddleware('maestro'),(req,res)=>{
    res.sendFile(path.join(__dirname, 'views','maestro','dashboard.html'))

});

app.get('/alumno' ,authMiddleware, roleMiddleware('alumno'),(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'alumno','dashboard.html'))
});



//ruta del API
app.use('/api',routes);



//iniciamos el servidor
const startServer = async()=>{
    try{
        await connectDB();//base de datos llamada
        app.listen(PORT,()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`);  
        });
    }catch(error){
        console.error("Error al iniciar el servidor:",error)
        process.exit(1)
    }
};

startServer();



