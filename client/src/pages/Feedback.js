import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Feedback = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [comments, setComments] = useState("");
  const [rol, setRol] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Debes iniciar sesión para ver tu membresía.");
      return;
    }

    const getUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/feedback/status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          console.log("✅ Usuario encontrado");
          setRol(response.data.data.id_rol || "");
          setFirstName(response.data.data.nombre || "");
          setLastName(response.data.data.apellido || "");
          setEmail(response.data.data.email || "");

          console.log(response.data.data.id_rol);
        } else {
          setError(response.data.message || "No se encontró el usuario.");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error al consultar.");
      }
    };

    getUser();

    const getComments = async (req, res) => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/feedback/comments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          console.log("✅ Comments encontrados");
          setComments(response.data.data);
        } else {
          setError(
            response.data.message || "No se encontraron los comentarios."
          );
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error al consultar.");
      }
    };
    getComments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message) {
      alert("Por favor escribe un comentario.");
      return;
    }

    try {
      console.log("Enviando feedback...", message);

      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        "http://localhost:3000/api/feedback/postFeedback",
        { comentario: message }, // 🔹 solo enviamos comentario
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("¡Gracias por tu feedback! 🙌");
        setSubmitted(true);
        setMessage(""); // resetear textarea
      } else {
        toast.error(response.data.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error durante el registro:", error);
      toast.error(
        error.response?.data?.message ||
          "Algo salió mal. Por favor intenta de nuevo."
      );
      setError("No se pudo enviar el feedback");
    }
  };

  const CommentsTable = ({ comments }) => {
    if (!comments || comments.length === 0) {
      return <p>No hay comentarios.</p>;
    }

    return (
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border-b">ID</th>
            <th className="p-2 border-b">ID Cliente</th>
            <th className="p-2 border-b">Comentario</th>
            <th className="p-2 border-b">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c, index) => (
            <tr
              key={c.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-2 border-b">{c.id}</td>
              <td className="p-2 border-b">{c.id_cliente}</td>
              <td className="p-2 border-b">{c.comentario}</td>
              <td className="p-2 border-b">
                {new Date(c.fecha).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div
      style={{
        backgroundImage: `url(${require("../img/fondo3.jpg")})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {rol === 2 ? (
        <div className="max-w-lg w-full text-center p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Feedback</h1>
          <p className="mb-6">
            ¿Tenés una queja o sugerencia? ¡Nos encantaría saber tu opinión! 💡
          </p>

          {submitted && (
            <p className="text-green-600 font-bold mb-4">
              ¡Gracias por tu comentario!
            </p>
          )}
          {error && <p className="text-red-600 font-bold mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={firstName}
              disabled
              className="p-3 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={lastName}
              disabled
              className="p-3 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              disabled
              className="p-3 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Escribe tu queja o sugerencia..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="p-3 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="p-3 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
            >
              Enviar
            </button>
          </form>

          <div className="mt-6">
            <Link to="/" className="text-blue-500 hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      ) : rol === 1 ? (
        <div className="max-w-lg w-full text-center p-6 bg-white rounded-lg shadow-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Comentarios</h1>

          {/* Aquí va la tabla */}
          <CommentsTable comments={comments} />
        </div>
      ) : (
        <div className="text-center">
          <div className="text-xl text-white font-medium mb-4">
            Debes iniciar sesión para enviar un feedback.
          </div>
          <a
            href="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Ir a inicio de sesión
          </a>
        </div>
      )}
    </div>
  );
};

export default Feedback;
