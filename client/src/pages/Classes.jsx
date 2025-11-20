import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import ClassCard from "../components/Class/ClassCard";
import ClassForm from "../components/Class/ClassForm";
import ReservationCard from "../components/Class/ReservationCard";
import { useMembership } from "../hooks/useMembership";

const Classes = () => {
  const [userData, setUserData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    horario_inicio: "",
    horario_fin: "",
    cupo_maximo: 10,
    id_entrenador: "",
  });

  // Estado para reservas del usuario
  const [userReservations, setUserReservations] = useState([]);

  const { membership, loading: loadingMembership } = useMembership();
  // Verificar permisos (debe declararse antes de cualquier uso)
  const isClient = userData?.id_rol === 2;
  const canManage = userData?.id_rol === 1 || userData?.id_rol === 3;

  useEffect(() => {
    if (!membership || !userData) return;

    // ✔️ ADMIN (1) / ENTRENADOR (3) SIEMPRE PUEDEN VER CLASES
    if (userData.id_rol === 1 || userData.id_rol === 3) {
      fetchClasses();
      return;
    }

    // ✔️ CLIENTE: solo tipo 2 (medio) y tipo 3 (libre)
    const tipo = membership.data?.tipo; // 1: basica, 2: medio, 3: libre

    if (membership.membershipActive && (tipo === 2 || tipo === 3)) {
      fetchClasses();
    } else {
      // Usuario con plan básico → terminar loading
      setClasses([]);
      setLoading(false);
    }
  }, [membership, userData]);

  // Cargar reservas del usuario (solo cliente)
  useEffect(() => {
    if (
      isClient &&
      userData &&
      membership?.membershipActive &&
      (membership?.data?.tipo === 2 || membership?.data?.tipo === 3) // medio o libre
    ) {
      api("/reservations")
        .then(setUserReservations)
        .catch(() => setUserReservations([]));
    } else {
      setUserReservations([]);
    }
  }, [userData, isClient, membership]);

  // Cancelar reserva
  const cancelReservation = async (reservationId) => {
    try {
      const res = await api(`/reservations/${reservationId}`, {
        method: "DELETE",
      });
      if (res.success) {
        toast.success(res.message || "Reserva cancelada");
        // Refrescar reservas y clases
        const reservas = await api("/reservations");
        setUserReservations(reservas);
        fetchClasses();
      } else {
        toast.error(res.message || "No se pudo cancelar la reserva");
      }
    } catch (error) {
      toast.error(error.message || "Error al cancelar la reserva");
    }
  };

  // Obtener datos del usuario
  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("userData"));
    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    }
  }, []);

  // Cargar clases cuando userData esté disponible
  // useEffect(() => {
  //   if (userData) {
  //     fetchClasses();
  //   }
  // }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  // API helper
  const api = async (path, options = {}) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("authToken");
    try {
      const response = await axios({
        url: `http://localhost:3000/api${path}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Cargar clases según rol
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const userSession = JSON.parse(sessionStorage.getItem("userData"));
      const user = userSession?.userData || userSession;

      // Cliente ve clases disponibles, admin/entrenador ve todas
      const endpoint = user?.id_rol === 2 ? "/classes/available" : "/classes";
      console.log("@@@@@@@@@@@aca entra@@@@@@@@@");
      const data = await api(endpoint);
      setClasses(data);
    } catch (error) {
      toast.error("Error al cargar clases");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reservar clase (solo clientes)
  const reserveClass = async (classId) => {
    try {
      await api("/reservations", {
        method: "POST",
        data: { id_clase: classId },
      });
      toast.success("¡Reserva realizada exitosamente!");
      // Refrescar reservas del usuario para que cambie a "Cancelar reserva" sin recargar
      const res = await api("/reservations");
      setUserReservations(res);
      fetchClasses();
    } catch (error) {
      toast.error(error.message || "Error al reservar clase");
    }
  };

  // Crear/actualizar clase
  const handleSaveClass = async (e) => {
    e.preventDefault();

    if (
      !formData.nombre ||
      !formData.fecha ||
      !formData.horario_inicio ||
      !formData.horario_fin ||
      !formData.cupo_maximo
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.horario_fin <= formData.horario_inicio) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    // Validar que la fecha no sea anterior al día actual
    const fechaActual = new Date().toISOString().split("T")[0];
    if (formData.fecha < fechaActual) {
      toast.error(
        "No se puede crear una clase en una fecha anterior al día actual"
      );
      return;
    }

    try {
      if (editingClass) {
        // Actualizar
        await api(`/classes/${editingClass.id_clase}`, {
          method: "PUT",
          data: formData,
        });
        toast.success("Clase actualizada exitosamente");
      } else {
        // Crear
        await api("/classes", {
          method: "POST",
          data: formData,
        });
        toast.success("Clase creada exitosamente");
      }

      setIsEditing(false);
      setEditingClass(null);
      setFormData({
        nombre: "",
        descripcion: "",
        fecha: "",
        horario_inicio: "",
        horario_fin: "",
        cupo_maximo: 10,
        id_entrenador: "",
      });
      fetchClasses();
    } catch (error) {
      toast.error(error.message || "Error al guardar clase");
    }
  };

  // Eliminar clase
  const deleteClass = async (classId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta clase?")) {
      return;
    }

    try {
      await api(`/classes/${classId}`, { method: "DELETE" });
      toast.success("Clase eliminada exitosamente");
      fetchClasses();
    } catch (error) {
      toast.error(error.message || "Error al eliminar clase");
    }
  };

  // Editar clase
  const editClass = (classItem) => {
    setEditingClass(classItem);

    // Extraer fecha y horas del horario concatenado
    const fechaHora = new Date(classItem.horario);
    const fecha = fechaHora.toISOString().split("T")[0];
    const horario_inicio = fechaHora.toTimeString().slice(0, 5);

    setFormData({
      nombre: classItem.nombre,
      descripcion: classItem.descripcion || "",
      fecha: fecha,
      horario_inicio: horario_inicio,
      horario_fin: "", // No tenemos esta info, el usuario tendrá que completarla
      cupo_maximo: classItem.cupo_maximo,
      id_entrenador: classItem.id_entrenador || "",
    });
    setIsEditing(true);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingClass(null);
    setFormData({
      nombre: "",
      descripcion: "",
      fecha: "",
      horario_inicio: "",
      horario_fin: "",
      cupo_maximo: 10,
      id_entrenador: "",
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no válida";
    }
  };

  // Verificar permisos (ya declarados arriba)
  /* ---------------------- ESTADO: CARGANDO / SIN PERMISOS ---------------------- */
  if (loadingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 animate-fadeInUp">
        <p className="text-xl">Verificando membresía...</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 animate-fadeInUp">
        <p className="text-xl">Cargando clases...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 animate-fadeInUp">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            Debes iniciar sesión para acceder a las clases.
          </p>
          <a
            href="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg"
          >
            Ir a inicio de sesión
          </a>
        </div>
      </div>
    );
  }
  
  const tipo = membership?.data?.tipo; // 1 = básica, 2 = medio, 3 = libre

  if (userData.id_rol === 2 && membership.membershipActive && tipo === 1) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Plan insuficiente</h2>
        <p className="mt-2 text-gray-600">
          Tu plan actual no permite acceder a clases. Solo los planes{" "}
          <b>Medio</b> y <b>Libre</b> incluyen clases.
        </p>

        <button
          onClick={() => (window.location.href = "/membership")}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Ver planes disponibles
        </button>
      </div>
    );
  }
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 animate-fadeInUp">
  //       <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
  //         <div className="text-xl text-gray-700 dark:text-gray-300 mb-4">
  //           Debes iniciar sesión para acceder a las clases.
  //         </div>
  //         <a
  //           href="/login"
  //           className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-all active:scale-95"
  //         >
  //           Ir a inicio de sesión
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }

  /* ---------------------- MODO EDICIÓN DE CLASES ---------------------- */
  if (isEditing && canManage) {
    return (
      <section className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-30 animate-fadeInUp">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Header edición */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {editingClass ? "Editar Clase" : "Nueva Clase"}
              </h2>

              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ClassForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSaveClass}
              onCancel={handleCancelEdit}
              editingClass={editingClass}
            />
          </div>
        </div>
      </section>
    );
  }

  if (loadingMembership)
    return <p className="text-center">Verificando membresía...</p>;

  if (!membership?.membershipActive) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Membresía inactiva</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener una membresía activa para ver y reservar clases.
        </p>

        <button
          onClick={() => (window.location.href = "/membership")}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Ir a membresía
        </button>
      </div>
    );
  }
  
  /* ---------------------- VISTA PRINCIPAL (LISTA DE CLASES) ---------------------- */
  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-300 animate-fadeInUp">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {isClient ? "Clases Disponibles" : "Gestión de Clases"}
                </h1>
                <p className="text-orange-100">
                  {isClient
                    ? "Reserva tu lugar en las clases que más te gusten"
                    : "Administra las clases del gimnasio"}
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-orange-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Nueva Clase
                </button>
              )}
            </div>
          </div>

          {/* LISTA DE CLASES */}
          <div className="p-6">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {isClient
                    ? "No hay clases disponibles"
                    : "No hay clases registradas"}
                </h3>

                <p className="text-gray-600 dark:text-gray-400">
                  {isClient
                    ? "Las nuevas clases aparecerán aquí cuando estén programadas"
                    : "Comienza creando tu primera clase"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <ClassCard
                    key={classItem.id_clase}
                    classItem={classItem}
                    isClient={isClient}
                    userReservations={userReservations}
                    onReserve={reserveClass}
                    onCancelReservation={cancelReservation}
                    onEdit={editClass}
                    onDelete={deleteClass}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------- RESERVAS DEL CLIENTE ---------------------- */}
        {isClient && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Mis Reservas
              </h2>
              <p className="text-orange-100">Tus turnos reservados</p>
            </div>

            <div className="p-6">
              {userReservations.filter((r) => r.estado === "reservado")
                .length === 0 ? (
                <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No tienes reservas activas.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userReservations
                    .filter((r) => r.estado === "reservado")
                    .map((res) => (
                      <ReservationCard
                        key={res.id}
                        reservation={res}
                        formatDate={formatDate}
                        onCancelReservation={cancelReservation}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Classes;
