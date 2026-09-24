// Role.ts
export interface RolInterface {
    idRol: number;
    idAplicacion?: number;
    nombre: string;
}

export interface UserInterface {
    idAplicacionUsuario: number;
    idAplicacion?: number;
    username?: string;
    fechaIni: Date;
    fechaFin?: Date;
    name?: string;
    provider?: string;
    providerId?: string;
    rememberToken?: string;
    estadoSesion: number;
    fechaValidacion?: Date;
    dni?: string;
    nombres?: string;
    apellidos?: string;
    estadoValidacion: number;
    pais?: string;
    refreshToken?: string;
    avatar?: string;
    password?: string;
    oldId?: number;
    fechaPurga?: Date;
    roles?: UserRolInterface[];
    isAuthenticated: boolean;
}

// UserRole.ts
export interface UserRolInterface {
    idUsuarioRol: number;
    aplicacionUsuario: UserInterface;
    rol: RolInterface;
    idEmpresa?: string;
    objetoPermitido?: string;
    fechaIni: Date;
    fechaFin?: Date;
    idUnidadNegocio?: string;
    oldIdUsu?: number;
    pais?: string;
    estado: number;
}
