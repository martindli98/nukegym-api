// Función para probar el token desde la consola del navegador
function testToken() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("authToken");

  console.log("Verificando token...");
  console.log("Token en localStorage:", localStorage.getItem("token"));
  console.log("Token en sessionStorage:", sessionStorage.getItem("authToken"));

  if (!token) {
    console.log(" No se encontró token. Debes iniciar sesión.");
    return;
  }

  console.log(" Token encontrado:", token.substring(0, 20) + "...");

  // Hacer petición de prueba
  fetch("http://localhost:3000/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Respuesta del servidor:", data);
    })
    .catch((error) => {
      console.error(" Error:", error);
    });
}

// Ejecutar en la consola del navegador: testToken()
