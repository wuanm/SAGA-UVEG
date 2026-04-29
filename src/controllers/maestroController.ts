import { Request, Response } from 'express';
import {pool} from '../config/database';
import { RowDataPacket } from 'mysql2';
import {  Usuario , Maestro, Carrera} from '../types';




// Obtener información de la carrera del maestro-.
export  const obtenerMiCarrera = async (req: Request, res: Response)=>{
    try {
        
        const userId = req.query.userId;

        if(!userId){
            return res.status(401).json({error: 'Usuario no autenticado'});
        }

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT
                c.id,
                c.nombre,
                c.descripcion,
                c.duracion_semestres,
                u.nombre as maestro_nombre,
                u.email
            FROM maestros  m
            INNER JOIN carreras c ON  m.carrera_id = c.id
            INNER JOIN usuarios u  ON m.usuario_id = u.id
            WHERE m.usuario_id = ?
            `,[userId]);

            if(rows.length === 0){
                return res.status(404).json({error:'No tienes carrera asignada'});
            }

            res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mi carrera' }); 
    }
};


// Obtener alumnos de mi carrera
export const obtenerMisAlumnos = async (req: Request, res: Response) => {
  try {
        const userId = req.query.userId;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.nombre, 
        u.email, 
        a.matricula, 
        a.semestre_actual, 
        a.telefono
      FROM maestros m
      INNER JOIN alumnos a ON m.carrera_id = a.carrera_id
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE m.usuario_id = ? AND u.activo = true
      ORDER BY a.semestre_actual, u.nombre
    `, [userId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

// Crear tarea
export const crearTarea = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    const { titulo, descripcion, link_drive} = req.body;

    // Obtener maestro_id y carrera_id
    const [maestro] = await pool.query<RowDataPacket[]>(
      'SELECT id, carrera_id FROM maestros WHERE usuario_id = ?',
      [userId]
    );


    if (maestro.length === 0) {
      return res.status(404).json({ error: 'Maestro no encontrado' });
    }

    await pool.query(
      'INSERT INTO tareas (maestro_id, carrera_id, titulo, descripcion, link_drive) VALUES (?, ?, ?, ?, ?)',
      [maestro[0].id, maestro[0].carrera_id, titulo, descripcion, link_drive]
    );

    res.status(201).json({ success: true, message: 'Tarea creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

// Obtener tareas creadas por maestro.
export const obtenerMisTareas = async (req: Request, res: Response) => {
  try {
      const userId = req.query.userId;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.id,
        t.titulo, 
        t.descripcion, 
        t.link_drive, 
        t.created_at
      FROM tareas t
      INNER JOIN maestros m ON t.maestro_id = m.id
      WHERE m.usuario_id = ?
      ORDER BY t.created_at DESC
    `, [userId]);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

//Obtener tareas enviadas por alumnos
export const obtenerEntregasPorTarea = async (req: Request, res: Response) => {
    try {
        const { tareaId } = req.params;

        const [entregas]: any = await pool.query(`
            SELECT 
                e.id, 
                e.link_respuesta_alumno, 
                e.fecha_envio,
                u.nombre AS alumno_nombre -- Sacamos el nombre desde la tabla usuarios
            FROM entregas_tareas e
            JOIN alumnos a ON e.alumno_id = a.id
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE e.tarea_id = ?
            ORDER BY e.fecha_envio DESC
        `, [tareaId]);

        res.json(entregas);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
};