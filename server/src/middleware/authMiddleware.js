import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "76348734687346874363443434343443333333333";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log(" Auth Header:", authHeader);
  console.log(" Token extraído:", token ? "Token presente" : "No token");

  if (!token) {
    console.log("No se encontró token");
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    console.log("Token válido para usuario:", user.id);
    req.user = user;
    next();
  });
};
