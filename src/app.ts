import express from "express"
import path from 'path'
import dotenv from 'dotenv';
import routes from './routes/routes'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDB} from './config/database';



dotenv.config();


const app = express()

const PORT: number= Number(process.env.PORT);
const HOST:string ='0.0.0.0';


// Middlewares
app.use(cors());
app.use(express.json());



//archivos estaticos
app.use(express.static(path.join(__dirname,'public')))


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'login.html'))
});

app.get('/director',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'director', 'dashboard.html'))
});

app.get('/maestro',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views','maestro','dashboard.html'))

});

app.get('/alumno',(req,res)=>{
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

