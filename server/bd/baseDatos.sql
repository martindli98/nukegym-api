CREATE DATABASE IF NOT EXISTS nukegymemr;
USE nukegymemr;

-- TABLA DE ROLES

CREATE TABLE Rol (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE USUARIOS

CREATE TABLE Usuario (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    num_emergencia VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    id_rol INT(11) NOT NULL,
    id_trainer INT NULL,
    apellido VARCHAR(100) NOT NULL,
    nro_documento INT(11) UNIQUE NOT NULL,
    fechaNac DATE,
    baja_usuario BOOLEAN DEFAULT FALSE,
    patologias VARCHAR(255),
    foto_avatar VARCHAR(255),
    FOREIGN KEY (id_rol) REFERENCES Rol(id),
    FOREIGN KEY (id_trainer) REFERENCES Usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE Entrenador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    especialidad VARCHAR(100),
    turno VARCHAR(100),
    cupos INT(50) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE PAGOS

CREATE TABLE Pago (
    id_pago INT(11) AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10,2) UNSIGNED NOT NULL,
    fecha_pago DATE NOT NULL,
    descuento DECIMAL(10,2) UNSIGNED DEFAULT 0, 
    tipo_plan ENUM('1m','3m','6m','1a') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE MEMBRESÍAS

CREATE TABLE Membresia (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_pago INT(11) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado ENUM('activo','baja','expirado') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_pago) REFERENCES Pago(id_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE CLASES

CREATE TABLE Clase (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_entrenador INT(11) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    cant_personas INT(3) UNSIGNED NOT NULL,
    FOREIGN KEY (id_entrenador) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE EJERCICIOS

CREATE TABLE Ejercicio (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    url_media VARCHAR(255),
    descripcion TEXT,
    musculo_principal VARCHAR(100),
    musculo_secundario VARCHAR(100),
    equipamiento VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE RUTINAS
-- (mejorada: cada rutina es una colección de ejercicios → relación N:M)

CREATE TABLE Rutina (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_entrenador INT,
    fecha DATE NOT NULL,
    nombre VARCHAR(100),
    objetivo VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
    FOREIGN KEY (id_entrenador) REFERENCES Entrenador(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Rutina_Ejercicio (
    id_rutina INT(11) NOT NULL,
    id_ejercicio INT(11) NOT NULL,
    series INT(11) DEFAULT 3,
    repeticiones INT(11) DEFAULT 12,
    PRIMARY KEY (id_rutina, id_ejercicio),
    FOREIGN KEY (id_rutina) REFERENCES Rutina(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES Ejercicio(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE PROGRESO

CREATE TABLE Progreso (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_ejercicio INT(11),
    id_usuario INT(11),
    peso INT(11) UNSIGNED,
    repeticiones INT(11) UNSIGNED,
    fecha_uno DATE NOT NULL,
    fecha_dos DATE NOT NULL,
    PRIMARY KEY (id_ejercicio, id_usuario, fecha_uno, fecha_dos),
    FOREIGN KEY (id_ejercicio) REFERENCES Ejercicio(id),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE NOTIFICACIONES

CREATE TABLE Notificacion (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE ASISTENCIA

CREATE TABLE Asistencia (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('presente','ausente','justificado') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE HISTORIAL

CREATE TABLE Historial (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_membresia INT(11) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_membresia) REFERENCES Membresia(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE RESERVAS

CREATE TABLE Reserva (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    estado ENUM('reservado','cancelado','suspendido') NOT NULL,
    id_usuario INT(11) NOT NULL,
    id_clase INT(11) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_clase) REFERENCES Clase(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- TABLA DE ENCUESTAS

CREATE TABLE Encuesta (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT(11) NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
