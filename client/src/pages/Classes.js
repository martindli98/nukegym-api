// import { useState, useEffect } from "react";
// import useUserProfile from "../hooks/useUserProfile";

// export default function Classes() {
//   const { user } = useUserProfile();
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     nombre: "",
//     descripcion: "",
//     horario: "",
//     cupo_maximo: 10,
//   });

//   const api = async (path, options = {}) => {
//     const token = localStorage.getItem("token");
//     const response = await fetch(`http://localhost:3000/api${path}`, {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         ...options.headers,
//       },
//     });
//     return response.json();
//   };

//   const loadClasses = async () => {
//     try {
//       // Cliente ve clases disponibles, admin/entrenador ve todas
//       const endpoint = user?.id_rol === 2 ? "/classes/available" : "/classes";
//       const data = await api(endpoint);
//       setClasses(data);
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) loadClasses();
//   }, [user]);

//   const createClass = async (e) => {
//     e.preventDefault();
//     try {
//       await api("/classes", {
//         method: "POST",
//         body: JSON.stringify(formData),
//       });
//       setShowForm(false);
//       setFormData({
//         nombre: "",
//         descripcion: "",
//         horario: "",
//         cupo_maximo: 10,
//       });
//       loadClasses();
//       alert("Clase creada exitosamente");
//     } catch (error) {
//       alert("Error al crear clase");
//     }
//   };

//   const reserveClass = async (id_clase) => {
//     try {
//       await api("/reservations", {
//         method: "POST",
//         body: JSON.stringify({ id_clase }),
//       });
//       alert("Reserva realizada exitosamente");
//       loadClasses();
//     } catch (error) {
//       alert("Error al reservar: " + (error.message || "Error desconocido"));
//     }
//   };

//   const deleteClass = async (id_clase) => {
//     if (!confirm("¿Eliminar esta clase?")) return;
//     try {
//       await api(`/classes/${id_clase}`, { method: "DELETE" });
//       loadClasses();
//       alert("Clase eliminada");
//     } catch (error) {
//       alert("Error al eliminar clase");
//     }
//   };

//   if (loading) return <div className="p-6">Cargando...</div>;

//   const isClient = user?.id_rol === 2;
//   const canManage = user?.id_rol === 1 || user?.id_rol === 3;

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">
//           {isClient ? "Clases Disponibles" : "Gestión de Clases"}
//         </h1>

//         {canManage && (
//           <button
//             onClick={() => setShowForm(!showForm)}
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//           >
//             {showForm ? "Cancelar" : "Nueva Clase"}
//           </button>
//         )}
//       </div>

//       {/* Formulario para crear clase */}
//       {showForm && canManage && (
//         <form
//           onSubmit={createClass}
//           className="bg-white p-6 rounded-lg shadow mb-6"
//         >
//           <div className="grid md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Nombre de la clase"
//               value={formData.nombre}
//               onChange={(e) =>
//                 setFormData({ ...formData, nombre: e.target.value })
//               }
//               className="border p-3 rounded"
//               required
//             />
//             <input
//               type="datetime-local"
//               value={formData.horario}
//               onChange={(e) =>
//                 setFormData({ ...formData, horario: e.target.value })
//               }
//               className="border p-3 rounded"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Descripción"
//               value={formData.descripcion}
//               onChange={(e) =>
//                 setFormData({ ...formData, descripcion: e.target.value })
//               }
//               className="border p-3 rounded"
//             />
//             <input
//               type="number"
//               placeholder="Cupo máximo"
//               min="1"
//               value={formData.cupo_maximo}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   cupo_maximo: parseInt(e.target.value),
//                 })
//               }
//               className="border p-3 rounded"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
//           >
//             Crear Clase
//           </button>
//         </form>
//       )}

//       {/* Lista de clases */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {classes.map((clase) => (
//           <div
//             key={clase.id_clase}
//             className="bg-white rounded-lg shadow-md p-6"
//           >
//             <h3 className="text-xl font-semibold mb-2 text-gray-800">
//               {clase.nombre}
//             </h3>
//             <p className="text-gray-600 mb-3">{clase.descripcion}</p>

//             <div className="space-y-2 text-sm text-gray-700">
//               <p>
//                 <strong>Horario:</strong>{" "}
//                 {new Date(clase.horario).toLocaleString()}
//               </p>
//               {clase.entrenador_nombre && (
//                 <p>
//                   <strong>Entrenador:</strong> {clase.entrenador_nombre}
//                 </p>
//               )}
//               <p>
//                 <strong>Cupo:</strong> {clase.cupo_maximo}
//               </p>
//               {clase.cupos_disponibles !== undefined && (
//                 <p>
//                   <strong>Disponibles:</strong> {clase.cupos_disponibles}
//                 </p>
//               )}
//             </div>

//             {/* Botones según rol */}
//             <div className="mt-4 flex gap-2">
//               {isClient && (
//                 <button
//                   onClick={() => reserveClass(clase.id_clase)}
//                   className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
//                 >
//                   Reservar
//                 </button>
//               )}

//               {canManage && (
//                 <button
//                   onClick={() => deleteClass(clase.id_clase)}
//                   className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//                 >
//                   Eliminar
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {classes.length === 0 && (
//         <div className="text-center py-8">
//           <p className="text-gray-500 text-lg">
//             {isClient
//               ? "No hay clases disponibles"
//               : "No hay clases registradas"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
