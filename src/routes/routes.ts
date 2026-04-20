import {Router} from 'express';
import  * as authController from '../controllers/authController'
import * as directorController from '../controllers/directorController';

import { authPlugins } from 'mysql2';



const router =Router();


//-----------------------------RUTAS DE DIRECCION--------------------------

//rutas autenticación
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/profile',authController.getProfile);


//rutas director/maestro
router.post('/auth/director/maestros', directorController.crearMaestro);
router.get('/auth/director/maestros', directorController.obtenerMaestros);
router.delete('/auth/director/maestros/:id', directorController.eliminarMaestro);
router.put('/auth/director/maestros/:id', directorController.actualizarMaestro);


//ruta director/carrera
router.post('/auth/director/carreras', directorController.crearCarrera);
router.get('/auth/director/carreras', directorController.obtenerCarreras);
router.delete('/auth/director/carreras/:id', directorController.eliminarCarrera);
router.put('/auth/director/carreras/:id', directorController.actualizarCarrera);


//ruta director alumno
router.post('/auth/director/alumnos', directorController.crearAlumno);
router.get('/auth/director/alumnos', directorController.obtenerAlumnos);
router.delete('/auth/director/alumnos/:id', directorController.eliminarAlumno);
router.put('/auth/director/alumnos/:id', directorController.actualizarAlumno);













export default router;