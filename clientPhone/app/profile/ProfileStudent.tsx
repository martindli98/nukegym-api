import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { showError, showSuccess } from "@/src/utils/toast";
import CreateRoutineModal from "../rutine/CreateRoutineModal";

interface Student {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nro_documento?: string;
  turno?: string;
}

export default function ProfileStudent({ onBack }: any) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trainerId, setTrainerId] = useState<number | null>(null);

  const fetchTrainerId = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;

      const u = JSON.parse(stored);
      const realUser = u.userData ? u.userData : u;
      setTrainerId(realUser.id ?? null);
    } catch {
      showError("Error cargando datos del entrenador");
    }
  };

  const fetchStudents = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) {
        showError("No se encontró información del usuario");
        setLoading(false);
        return;
      }

      const u = JSON.parse(stored);
      const realUser = u.userData ? u.userData : u;

      console.log("@@@ User data:", realUser);
      console.log("@@@ User ID:", realUser.id);
      console.log("@@@ User id_rol:", realUser.id_rol);

      // Verificar que es entrenador
      if (realUser.id_rol !== 3) {
        showError("Solo los entrenadores pueden ver alumnos");
        setLoading(false);
        return;
      }

      // Usar el mismo endpoint que Trainer.js: /trainers/{id}/alumnos
      const res = await api(`/trainers/${realUser.id}/alumnos`);
      
      console.log("@@@ Students response:", res);

      // La respuesta es directamente el array de estudiantes
      if (Array.isArray(res)) {
        setStudents(res);
      } else if (res.data && Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.log("ERROR EN FETCH STUDENTS:", error);
      if (error.response?.status === 404) {
        setStudents([]);
        showError("No tienes alumnos asignados");
      } else {
        showError("Error al cargar alumnos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoutine = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleRoutineCreated = () => {
    showSuccess("Rutina asignada correctamente");
    setModalVisible(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchTrainerId();
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mis Alumnos</Text>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes alumnos asignados actualmente
          </Text>
        </View>
      ) : (
        students.map((student) => (
          <View key={student.id} style={styles.card}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.nombre} {student.apellido}
              </Text>
              <Text style={styles.label}>Email: {student.email}</Text>
              {student.nro_documento && (
                <Text style={styles.label}>DNI: {student.nro_documento}</Text>
              )}
              {student.turno && (
                <Text style={styles.label}>Turno: {student.turno}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => handleAssignRoutine(student)}
            >
              <Text style={styles.btnText}>Asignar Rutina</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {selectedStudent && (
        <CreateRoutineModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedStudent(null);
          }}
          onCreated={handleRoutineCreated}
          studentId={selectedStudent.id}
          trainerId={trainerId}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f3f4f6" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f3f4f6"
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6D28D9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6D28D9",
  },
  emptyContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  label: { 
    fontSize: 14, 
    marginTop: 4, 
    color: "#6b7280" 
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#6D28D9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16,
  },
});
