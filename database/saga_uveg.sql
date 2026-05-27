-- ======================================================
          -- BASE DE DATOS: SAGA-UVEG
-- ======================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS`SAGA-UVEG`;

USE `SAGA-UVEG`;

-- TABLA: usuarios
CREATE TABLE `usuarios` (
`id` int NOT NULL AUTO_INCREMENT,
`nombre` varchar(100) NOT NULL,
`email` varchar(100) NOT NULL,
`password` varchar(255) NOT NULL,
`rol` enum('director','maestro','alumno') NOT NULL,
`activo` tinyint(1) DEFAULT '1',
PRIMARY KEY (`id`),
UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLA: carreras
CREATE TABLE `carreras` (
`id` int NOT NULL AUTO_INCREMENT,
`nombre` varchar(100) NOT NULL,
`descripcion` text,
`duracion_semestres` int NOT NULL,
`activo` tinyint(1) DEFAULT '1',
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLA: alumnos 
CREATE TABLE `alumnos` (
`id` int NOT NULL AUTO_INCREMENT,
`usuario_id` int NOT NULL,
`matricula` varchar(20) NOT NULL,
`carrera_id` int NOT NULL,
`semestre_actual` int DEFAULT '1',
`telefono` varchar(20) DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `usuario_id` (`usuario_id`),
UNIQUE KEY `matricula` (`matricula`),

KEY `carrera_id` (`carrera_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- TABLA: maestros 
CREATE TABLE `maestros` (
`id` int NOT NULL AUTO_INCREMENT,
`usuario_id` int NOT NULL,
`especialidad` varchar(100) DEFAULT NULL,
`titulo` varchar(100) DEFAULT NULL,
`telefono` varchar(20) DEFAULT NULL,
`carrera_id` int DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `usuario_id` (`usuario_id`),
KEY `carrera_id` (`carrera_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- TABLA: tareas
CREATE TABLE `tareas` (
`id` int NOT NULL AUTO_INCREMENT,
`maestro_id` int NOT NULL,
`carrera_id` int NOT NULL,
`titulo` varchar(200) NOT NULL,
`descripcion` text,
`link_drive` varchar(500) DEFAULT NULL,
`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
KEY `maestro_id` (`maestro_id`),
KEY `carrera_id` (`carrera_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- TABLA: entregas_tareas
CREATE TABLE `entregas_tareas` (
`id` int NOT NULL AUTO_INCREMENT,
`tarea_id` int NOT NULL,
`alumno_id` int NOT NULL,
`link_respuesta_alumno` varchar(255) DEFAULT NULL,
`fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
KEY `tarea_id` (`tarea_id`),
KEY `alumno_id` (`alumno_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CLAVES FORÁNEAS
ALTER TABLE `alumnos`
ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES
`usuarios` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `alumnos_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES
`carreras` (`id`);
ALTER TABLE `maestros`
ADD CONSTRAINT `maestros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES
`usuarios` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `maestros_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES
`carreras` (`id`);
ALTER TABLE `tareas`
ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`maestro_id`) REFERENCES
`maestros` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES
`carreras` (`id`) ON DELETE CASCADE;
ALTER TABLE `entregas_tareas`
ADD CONSTRAINT `entregas_tareas_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES
`tareas` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `entregas_tareas_ibfk_2` FOREIGN KEY (`alumno_id`)
REFERENCES `alumnos` (`id`) ON DELETE CASCADE;



-- DATOS INICIALES: DIRECTOR
-- Cambiar datos por reales y poner password encripatado, en src/utils/generatehasht.ts puede generarla.
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`) VALUES
(1, 'AQUI NOMBRE', 'AQUI_CORREO',
'AQUI PASSWORD ENCRIPTADO REALIZARLO EN  SRC/UTILS/GENERATEHASHT.TS', 'director', 1);