import {Router} from 'express';
import  * as authController from '../controllers/authController'
import * as directorController from '../controllers/directorController';
import * as maestroController from '../controllers/maestroController';
import * as alumnoController from  '../controllers/alumnoController'

import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { authPlugins } from 'mysql2';



const router =Router();


//-----------------------------RUTAS DE DIRECCION--------------------------

// Rutas autenticación
router.post('/auth/login', authController.login)
router.post('/auth/logout', authMiddleware, authController.logout)
router.get('/auth/profile', authMiddleware, authController.getProfile)


// Rutas director/maestro
router.post('/auth/director/maestros',
    authMiddleware,
    roleMiddleware('director'),
     directorController.crearMaestro
    );

router.get('/auth/director/maestros', 
    authMiddleware,
    roleMiddleware('director'),
    directorController.obtenerMaestros
);

router.delete('/auth/director/maestros/:id', 
    authMiddleware,
    roleMiddleware('director'),
    directorController.eliminarMaestro
);

router.put('/auth/director/maestros/:id', 
    authMiddleware,
    roleMiddleware('director'),
    directorController.actualizarMaestro
);


// Ruta director/carrera
router.post('/auth/director/carreras',
    authMiddleware,
    roleMiddleware('director'),
    directorController.crearCarrera
);

router.get('/auth/director/carreras',
    authMiddleware,
    roleMiddleware('director'),
     directorController.obtenerCarreras
    );

router.delete('/auth/director/carreras/:id', 
    authMiddleware,
    roleMiddleware('director'),
    directorController.eliminarCarrera
);

router.put('/auth/director/carreras/:id',
    authMiddleware,
    roleMiddleware('director'),
    directorController.actualizarCarrera
);


// Ruta director alumno
router.post('/auth/director/alumnos', 
        authMiddleware,
        roleMiddleware('director'),
        directorController.crearAlumno);

router.get('/auth/director/alumnos', 
        authMiddleware,
        roleMiddleware('director'),
        directorController.obtenerAlumnos)
        ;
router.delete('/auth/director/alumnos/:id', 
        authMiddleware,
        roleMiddleware('director'),
        directorController.eliminarAlumno
    );
router.put('/auth/director/alumnos/:id', 
        authMiddleware,
        roleMiddleware('director'),
        directorController.actualizarAlumno
);




//------------------------RUTAS DE DOCENTE----------------------
router.get(
    '/auth/maestro/carrera',
    authMiddleware,
    roleMiddleware('maestro'),
    maestroController.obtenerMiCarrera
);
router.get(
    '/auth/maestro/alumnos',
    authMiddleware,
    roleMiddleware('maestro'),
    maestroController.obtenerMisAlumnos
);
router.post(
    '/auth/maestro/tareas',
    authMiddleware,
    roleMiddleware('maestro'),
    maestroController.crearTarea
);
router.get(
    '/auth/maestro/tareas',
    authMiddleware,
    roleMiddleware('maestro'),
    maestroController.obtenerMisTareas
);
router.get(
    '/auth/maestro/tareas/:tareaId/entregas',
    authMiddleware,
    roleMiddleware('maestro'),
    maestroController.obtenerEntregasPorTarea
);





//------------------------RUTAS DE ALUMNO----------------------
router.get(
    '/auth/alumno/carrera',
    authMiddleware,
    roleMiddleware('alumno'),
    alumnoController.obtenerMiCarrera
);
router.get(
    '/auth/alumno/companeros',
    authMiddleware,
    roleMiddleware('alumno'),
    alumnoController.obtenerCompaneros 

);
router.get(
    '/auth/alumno/materias',
    authMiddleware,
    roleMiddleware('alumno'),
    alumnoController.obtenerMisMaterias
);

router.post(
    '/auth/alumno/entregar',
    authMiddleware,
    roleMiddleware('alumno'),
    alumnoController.subirTarea
);













export default router;