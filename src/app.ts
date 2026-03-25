import express from "express"
import path from 'path'

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));





app.get('/maestro',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'maestro','dashboard.html'))
});

app.get('/director',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'director','dashboard.html'))
});


















app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});