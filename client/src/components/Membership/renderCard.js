// Función para centralizar estilos y reusar
const RenderCard = ({ title, subtitle, color = "white" }) => (
  <div
    style={{
      backgroundImage: `url(${require("../../img/fondo2.jpg")})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.6)", // negro con opacidad
        padding: "30px 50px",
        borderRadius: "12px",
        textAlign: "center",
        color: color,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.7)",
      }}
    >
      <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>{title}</h2>
      {subtitle && (
        <p style={{ marginTop: "10px", fontSize: "18px", opacity: 0.9 }}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

export default RenderCard;