import { pool } from "../config/db.js";

const roleTableQuery = `CREATE TABLE IF NOT EXISTS Rol (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('admin', 'cliente', 'entrenador') DEFAULT 'cliente' NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const userTableQuery = `CREATE TABLE IF NOT EXISTS Usuario (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    num_emergencia VARCHAR(20),
    num_personal VARCHAR(20),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;


const trainerTableQuery = `CREATE TABLE IF NOT EXISTS Entrenador (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    especialidad VARCHAR(100),
    turno ENUM('mañana', 'tarde', 'noche') DEFAULT 'mañana' NOT NULL,
    cupos INT(50) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

const addTrainerFkQuery = `
  ALTER TABLE Usuario
  ADD CONSTRAINT fk_usuario_id_trainer
  FOREIGN KEY (id_trainer) REFERENCES Entrenador(id)
  ON DELETE SET NULL;
`;

const paymentTableQuery = `CREATE TABLE IF NOT EXISTS Pago (
  id_pago INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
    valor DECIMAL(10,2) UNSIGNED NOT NULL,
    fecha_pago DATE NOT NULL,
    descuento DECIMAL(10,2) UNSIGNED DEFAULT 0, 
    tipo_plan ENUM('1m','3m','6m','1a') NOT NULL,
    estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
    id_preference VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const membershipTableQuery = `CREATE TABLE IF NOT EXISTS Membresia (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_pago INT(11) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    tipo INT(11) NOT NULL,
    estado ENUM('activo','baja','expirado') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_pago) REFERENCES Pago(id_pago),
    FOREIGN KEY (tipo) REFERENCES Planes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const plansTableQuery= `CREATE TABLE IF NOT EXISTS Planes ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
nombre VARCHAR(100) NOT NULL, 
descripcion VARCHAR(255), 
precio DECIMAL(10,2) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

const classTableQuery = `CREATE TABLE IF NOT EXISTS Clase(
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_entrenador INT(11) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    cant_personas INT(3) UNSIGNED NOT NULL,
    FOREIGN KEY (id_entrenador) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const exerciseTableQuery = `CREATE TABLE IF NOT EXISTS Ejercicio (
   id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    url_media VARCHAR(255),
    descripcion TEXT,
    musculo_principal ENUM('Pecho', 'Espalda', 'Hombros', 'Biceps', 'Triceps', 'Cuadriceps', 'Gemelos', 'Isquiotibiales', 'Gluteos', 'Trapecio', 'Antebrazo', 'Aductores', 'Abductores', 'Abdominales') DEFAULT NULL,
    musculo_secundario ENUM('Pecho', 'Espalda', 'Hombros', 'Biceps', 'Triceps', 'Cuadriceps', 'Gemelos', 'Isquiotibiales', 'Gluteos', 'Trapecio', 'Antebrazo', 'Aductores', 'Abductores', 'Abdominales') DEFAULT NULL,
    equipamiento VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const routineTableQuery = `CREATE TABLE IF NOT EXISTS Rutina (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_entrenador INT NULL,
    fecha DATE NOT NULL,
    nombre VARCHAR(100),
    objetivo VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_entrenador) REFERENCES Usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const routineExerciseTableQuery = `CREATE TABLE IF NOT EXISTS Rutina_Ejercicio ( 
    id_rutina INT(11) NOT NULL,
    id_ejercicio INT(11) NOT NULL,
    series INT(11) DEFAULT 3,
    repeticiones INT(11) DEFAULT 12,
    PRIMARY KEY (id_rutina, id_ejercicio),
    FOREIGN KEY (id_rutina) REFERENCES Rutina(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES Ejercicio(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;


const progressTableQuery = `CREATE TABLE IF NOT EXISTS Progreso (id_ejercicio INT(11),
    id_usuario INT(11),
    peso INT(11) UNSIGNED,
    repeticiones INT(11) UNSIGNED,
    fecha_uno DATE NOT NULL,
    fecha_dos DATE NOT NULL,
    PRIMARY KEY (id_ejercicio, id_usuario, fecha_uno, fecha_dos),
    FOREIGN KEY (id_ejercicio) REFERENCES Ejercicio(id),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const notificationTableQuery = `CREATE TABLE IF NOT EXISTS Notificacion (id INT(11) AUTO_INCREMENT PRIMARY KEY,
id_usuario INT(11) NOT NULL,
titulo VARCHAR(100) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const asistanceTableQuery = `CREATE TABLE IF NOT EXISTS Asistencia ( id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_clase INT(11) NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('presente','ausente','justificado') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_clase) REFERENCES Clase(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const historyTableQuery = `CREATE TABLE IF NOT EXISTS Historial (id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(11) NOT NULL,
    id_membresia INT(11) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_membresia) REFERENCES Membresia(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const reservationTableQuery = `CREATE TABLE IF NOT EXISTS Reserva (id INT(11) AUTO_INCREMENT PRIMARY KEY,
    estado ENUM('reservado','cancelado','suspendido') NOT NULL,
    id_usuario INT(11) NOT NULL,
    id_clase INT(11) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_clase) REFERENCES Clase(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const surveyTableQuery = `CREATE TABLE IF NOT EXISTS Encuesta (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT(11) NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.log(`Error creating ${tableName}`, error);
  }
};

const insertDefaultRoles = async () => {
  try {
    // Verifica si ya existen roles
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM Rol");
    if (rows[0].count === 0) {
      // Inserta roles por defecto
      await pool.query(`
        INSERT INTO Rol (tipo) VALUES 
        ('admin'), 
        ('cliente'), 
        ('entrenador')
      `);
      console.log("Default roles inserted successfully!");
    } else {
      console.log("Roles already exist, skipping insertion");
    }
  } catch (error) {
    console.log("Error inserting default roles:", error);
  }
};


  const insertDefaultPlans = async () => { 
    try { 
      const [rows] = await pool.query("SELECT COUNT(*) as count FROM Planes"); 
      if (rows[0].count === 0) { 
        await pool.query(`
          INSERT INTO Planes (nombre, descripcion, precio) VALUES 
          ('Basico', 'Acceso total por 9 dias al mes (2 dias a la semana)', 15000.00), 
          ('Medio', 'Acceso total por 13 dias al mes (3 dias a la semana)', 40000.00), 
          ('Libre', 'Acceso total libre por todo el mes', 75000.00);
        `); 
        console.log("Default plans inserted successfully!"); 
      } else { 
        console.log("Plans already exist, skipping insertion"); 
      } 
    } catch (error) { 
      console.log("Error inserting default plans:", error); 
    } 
  };


const createAllTable = async () => {
  try {
    await createTable("Rol", roleTableQuery);
    await insertDefaultRoles();
    await createTable("Usuario", userTableQuery);
    await createTable("Planes", plansTableQuery); // ⬅️ mover arriba
    await insertDefaultPlans(); // ⬅️ cargar planes antes
    await createTable("Entrenador",trainerTableQuery);
    await pool.query(addTrainerFkQuery)
    await createTable("Pago", paymentTableQuery);
    await createTable("Membresia", membershipTableQuery);
    await createTable("Clase", classTableQuery);
    await createTable("Ejercicio", exerciseTableQuery);
    await createTable("Rutina", routineTableQuery);
    await createTable("Rutina_Ejercicio", routineExerciseTableQuery);
    await createTable("Progreso", progressTableQuery);
    await createTable("Notificacion", notificationTableQuery);
    await createTable("Asistencia", asistanceTableQuery);
    await createTable("Historial", historyTableQuery);
    await createTable("Reserva", reservationTableQuery);
    await createTable("Encuesta", surveyTableQuery);
    await insertDefaultPlans();
    console.log("All tables created successfully!!");
  } catch (error) {
    console.log("Error creating tables", error);
    throw error;
  }
};

export default createAllTable;
