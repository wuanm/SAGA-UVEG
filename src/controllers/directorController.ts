import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {pool} from '../config/database';
import { RowDataPacket } from 'mysql2';
import {  Usuario , Maestro, Carrera} from '../types';
import { connect } from 'http2';



//crear maestro
export const  crearMaestro = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try{
    await connection.beginTransaction();//juntar todo como si fuera un  bloque


    const{nombre,email,password,carrera_id,especialidad,titulo, telefono}= req.body ;
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insertamos al usuario con rol de maestro tabla usuario
    const [userResult]: any = await connection.query(
        'INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)',
        [nombre,email,hashedPassword,'maestro']
    );

    //insertamos al maestro  a su tabla
    await connection.query(
    'INSERT INTO maestros (usuario_id, especialidad, titulo, telefono,carrera_id) VALUES (?, ?, ?, ?,?)',
    [userResult.insertId, especialidad, titulo, telefono,carrera_id]
      );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Maestro creado exitosamente' });
  }catch(error:any){
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'El email ya existe' });
      } else {
        res.status(500).json({ error: 'Error al crear maestro' });
      }
  } finally {
    connection.release();
  }
  };


// Obtener Maestros
export const obtenerMaestros = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
          u.id,
          u.nombre, 
          u.email, 
          m.carrera_id,
          m.especialidad, 
          m.titulo, 
          m.telefono, 
          u.activo
      FROM usuarios u
      INNER JOIN maestros m ON u.id = m.usuario_id
      WHERE u.rol = 'maestro'
      ORDER BY u.nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener maestros' });
  }
};

//Eliminar maestros
export const eliminarMaestro = async (req: Request, res: Response) => {
  const { id } = req.params; // Este es el ID del usuario
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();//se usa cuando se trabaja con mas de dos tablas

    
    await connection.query('DELETE FROM maestros WHERE usuario_id = ?', [id]);

    const [result]: any = await connection.query(
      'DELETE FROM usuarios WHERE id = ? AND rol = "maestro"',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Maestro no encontrado' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Maestro eliminado permanentemente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error al eliminar el maestro de la base de datos' });
  } finally {
    connection.release();
  }
};

//actualizar maestro
export const actualizarMaestro = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, email, password, carrera_id, especialidad, titulo, telefono } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (password && password.trim() !== "") {
            // Si el director puso un password nuevo, lo encriptamos
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(
                'UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?',
                [nombre, email, hashedPassword, id]
            );
        } else {
            // Si no hay password, solo nombre y email
            await connection.query(
                'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
                [nombre, email, id]
            );
        }

        //actualizamos
        await connection.query(
            'UPDATE maestros SET especialidad = ?, titulo = ?, telefono = ?, carrera_id = ? WHERE usuario_id = ?',
            [especialidad, titulo, telefono, carrera_id, id]
        );

        await connection.commit();
        res.json({ success: true, message: 'Actualizado correctamente' });

    } catch (error: any) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    } finally {
        connection.release();
    }
};

//crear alumno
export const crearAlumno = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {nombre,email,password,matricula, carrera_id,telefono} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] : any= await connection.query(
      `INSERT INTO   usuarios (nombre,email,password,rol) VALUES (?,?,?,?)`,
      [nombre,email,hashedPassword,'alumno']
    
    );

    await connection.query(
      `INSERT INTO  alumnos (usuario_id,matricula,carrera_id,telefono) VALUES (?,?,?,?)`,
      [userResult.insertId,matricula,carrera_id,telefono]

    );
    await connection.commit();

    res.status(201).json({ success: true, message: 'Alumno creado exitosamente' });
  } catch (error:any) {
    await connection.rollback();
    if(error.code === 'ER_DUP_ENTRY'){
      res.status(400).json({ error: 'El email ya existe' });
    }else{
      res.status(500).json({ error: 'Error al crear alumno' });
    }
  } finally {
    connection.release();
  }
};

//obtener alumnos
export const obtenerAlumnos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
          u.id, 
          u.nombre, 
          u.email, 
          a.matricula, 
          a.carrera_id,
          c.nombre as carrera,
          a.semestre_actual,
          a.telefono, 
          u.activo
      FROM usuarios u
      INNER JOIN alumnos a ON u.id = a.usuario_id
      INNER JOIN carreras c ON a.carrera_id = c.id
      WHERE u.rol = 'alumno'
      ORDER BY u.nombre
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

//eliminar alumno
export const eliminarAlumno = async (req: Request, res: Response) => {
  const { id } = req.params; // Este es el ID del usuario
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();//se usa cuando se trabaja con mas de dos tablas

    
    await connection.query('DELETE FROM alumnos WHERE usuario_id = ?', [id]);

    const [result]: any = await connection.query(
      'DELETE FROM usuarios WHERE id = ? AND rol = "alumno"',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Alumno eliminado permanentemente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error al eliminar el alumno de la base de datos' });
  } finally {
    connection.release();
  }
};

//actualizar Alumno
export const actualizarAlumno = async (req: Request, res: Response) => {
    const { id } = req.params;
     const {nombre,email,password,matricula, carrera_id,telefono} = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (password && password.trim() !== "") {
            // Si el alumno puso un password nuevo, lo encriptamos
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(
                'UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?',
                [nombre, email, hashedPassword, id]
            );
        } else {
            // Si no hay password, solo nombre y email
            await connection.query(
                'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
                [nombre, email, id]
            );
        };

        //actualizamos
        await connection.query(
            'UPDATE alumnos SET matricula= ?, carrera_id = ?, telefono = ? WHERE usuario_id = ?',
            [matricula, carrera_id, telefono, id]
        );

        await connection.commit();
        res.json({ success: true, message: 'Actualizado correctamente' });

    } catch (error: any) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    } finally {
        connection.release();
    }
};

// obtener carreras
export const obtenerCarreras = async (req:Request, res: Response )=>{

  try {
    const [rows]= await pool.query<RowDataPacket[]>(
    `SELECT
    * 
    FROM carreras
    ORDER BY nombre
    `
    );

    res.json(rows);
  } catch (error:any) {
    res.status(500).json({error: 'Error al obtener carreras'});
  }
};

//crear carreras
export  const crearCarrera = async (req: Request, res: Response)=>{
  try {
    const {nombre, descripcion, duracion_semestres} = req.body as Carrera;

    await pool.query( 
      `INSERT INTO carreras (nombre,descripcion,duracion_semestres) VALUES (?,?,?)`,
      [nombre,descripcion,duracion_semestres]  
    );
    
    res.status(201).json({success:true, message: 'Carrera creada exitosamente'})
    console.log('Carrera creada exitosamente'); 
  } catch ( error : any) {
    console.error('Error al crear carrera:', error);
    res.status(500).json({error:'Error al crear carrera'})
    
  }
};

//eliminar carreras
export const eliminarCarrera = async (req: Request, res: Response) => {
  const { id } = req.params; // Este es el ID de la carrera
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      'DELETE FROM carreras WHERE id = ? ',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Carrera no encontrado' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Carrera eliminado permanentemente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error al eliminar la carrera de la base de datos' });
  } finally {
    connection.release();
  }
};

//actualizar Alumno
export const actualizarCarrera = async (req: Request, res: Response) => {
    const { id } = req.params;
     const {nombre,descripcion, duracion_semestres} = req.body;

    const connection = await pool.getConnection();

    try {

        await connection.query(
            'UPDATE carreras SET nombre = ?, descripcion = ?, duracion_semestres = ? WHERE id = ?',
            [nombre, descripcion, duracion_semestres,id]
        );

        await connection.commit();
        res.json({ success: true, message: 'Actualizado correctamente' });

    } catch (error: any) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    } finally {
        connection.release();
    }
};