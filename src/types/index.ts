export interface Usuario { 
    id: number; 
    nombre: string; 
    email: string; 
    password: string; rol: 'director' | 'maestro' | 'alumno';
    activo: boolean; 
    created_at?: Date; 
    updated_at?: Date; 
}

export interface Maestro {
  id: number;
  usuario_id: number;
  especialidad: string;
  titulo: string;
  telefono: string;
}

export interface Alumno {
  id: number;
  usuario_id: number;
  matricula: string;
  carrera_id: number;
  semestre_actual: number;
  telefono: string;
}


export interface Carrera {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_semestres: number;
  activo: boolean
}

export interface JwtPayload {
  id: number;
  email: string;
  rol: 'director' | 'maestro' | 'alumno';
}
