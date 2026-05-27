import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import  {JwtPayload} from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
};
//validacion la autenticidad  del  brazalet

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Es una petición de página HTML o de datos API?
        if (req.accepts('html') && !req.path.startsWith('/api')) {
          return res.redirect('/'); // Mandar al login (página)
        }
        return res.status(401).json({ error: 'No autorizado' }); // Mandar JSON (API)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded;
    next();

  } catch (error) {
      if (req.accepts('html') && !req.path.startsWith('/api')) {
        res.clearCookie('token');
        return res.redirect('/');
      }
      return res.status(401).json({ error: 'Token inválido' });
  }
};





//verifica si se tiene permiso para estar en esa area


export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      //return res.status(401).json({ error: 'No autorizado' }); mensaje para el desarrollador
      return res.redirect('/'); //redireccion al cliente
    }

    if (!roles.includes(req.user.rol)) {
      // return res.status(403).json({ error: 'Acceso denegado - Rol insuficiente' }); para el desarrollador
     return res.redirect(`/${req.user.rol}`);//redireccion al cliente
    }

    next();
  };
};