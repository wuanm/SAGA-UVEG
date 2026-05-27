import { Request,Response } from "express";
import {pool} from '../config/database';
import { RowDataPacket } from "mysql2";


export const obtenerMiCarrera = async (req: Request, res: Response) => { 
  try {
    const userId = (req as any).user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.nombre, 
        c.descripcion, 
        c.duracion_semestres,
        a.semestre_actual, 
        a.matricula
      FROM alumnos a
      INNER JOIN carreras c ON a.carrera_id = c.id
      WHERE a.usuario_id = ?
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    res.json(rows[0]);
    
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrera' });
  }
};


export const obtenerCompaneros = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
          u.id,
          u.nombre, 
          u.email, 
          a.matricula, 
          a.semestre_actual
      FROM alumnos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.carrera_id = (
                SELECT carrera_id FROM alumnos WHERE usuario_id = ?
            ) AND u.activo = true
      ORDER BY u.nombre ASC
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener compañeros:', error);
    res.status(500).json([]);
  }
};


// obtener las actividades de la materia (Pendientes)
export const obtenerMisMaterias = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // ID del usuario desde el JWT

    // 1. Obtenemos el ID del alumno y su carrera
    const [alumnoData]: any = await pool.query(
      `SELECT id, carrera_id FROM alumnos WHERE usuario_id = ?`, 
      [userId]
    );

    if (alumnoData.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const alumnoId = alumnoData[0].id;
    const miCarrera = alumnoData[0].carrera_id;

    // 2. Traemos las tareas que NO están en la tabla de entregas para este alumno
    const [tareas]: any = await pool.query(`
        SELECT
            t.id,
            t.titulo,
            t.descripcion,
            t.link_drive,
            t.created_at
        FROM tareas t
        WHERE t.carrera_id = ? 
        AND t.id NOT IN (
            SELECT tarea_id 
            FROM entregas_tareas 
            WHERE alumno_id = ?
        )
        ORDER BY t.created_at DESC
      `, [miCarrera, alumnoId]
    );

    res.json(tareas);
    
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json([]);
  }
};

export const subirTarea = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const {tarea_id, link_respuesta} = req.body;

    // Obtenemos el alumno
    const [alumno]:any = await pool.query(`
        SELECT
          id
        FROM alumnos
        WHERE usuario_id = ?
      `,[userId])


    const alumno_id = alumno[0]?.id;

    //utilizamos duplicate para corregir envio
    await pool.query(`
      INSERT INTO
        entregas_tareas (alumno_id, tarea_id, link_respuesta_alumno)
      VALUES
            (?, ?, ?)
      ON DUPLICATE KEY UPDATE
            link_respuesta_alumno = ?
      `,[alumno_id, tarea_id, link_respuesta, link_respuesta]
    );

    res.json({ success: true, message: 'Tarea enviada exitosamente ' }); 
    
  } catch (error) {
    console.error('Error al subir tarea:', error);
   res.status(500).json({ success: false, message: 'Error interno del servidor' });

    
  };
};

