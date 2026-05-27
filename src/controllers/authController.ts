import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {pool} from '../config/database';
import { Usuario } from '../types';

//api con metodos de login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as Usuario;
    
  

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = true',
      [email]
    );

    const usuarios = rows as Usuario[];
    


    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];



   // Contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    
  

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

 //brazalete de identificación
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true, //javascriptt no puede leer la cookie
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


///cearar login
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Sesión cerrada' });
};



//ver los perfiles
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

 
    const [rows] = await pool.query(   
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
      [userId]
    )as any;

    const usuario = rows as Usuario[];


    //if (rows.length === 0) {
    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    //res.json(rows[0]);
    res.json(usuario[0]); 
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};