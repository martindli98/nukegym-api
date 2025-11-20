export interface MembershipData {
  tipo: number;
}

export interface Membership {
  success: boolean;
  membershipActive: boolean;
  data: MembershipData;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  musculo_principal?: string;
  series?: number;
  repeticiones?: number;
  descripcion?: string;
  url_media?: string;
}

export interface Rutina {
  id: number;
  objetivo: string;
  fecha: string;
  ejercicios: Ejercicio[];
}

export interface User {
  id: number;
  nombre?: string;
  email?: string;
  id_rol?: number;
  tipo_rol: string;
}

export interface Student {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}
