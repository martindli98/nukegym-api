import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import Logo from "../../../img/LOGO GYM.png";

// 🎨 Estilos del PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "2px solid #000",
    paddingBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    color: "#333",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginTop: 15,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottomColor: "#bfbfbf",
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  tableColHeader: {
    width: "16%",
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
    textAlign: "center",
    padding: 4,
    fontWeight: "bold",
  },
  tableCol: {
    width: "16%",
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
    textAlign: "center",
    padding: 4,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 10,
    color: "#777",
  },
});

function PDF({ memberships = [] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.title}>Listado de Membresías</Text>
        </View>

       
        <View style={styles.table}>
        
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableColHeader}>Usuario</Text>
            <Text style={styles.tableColHeader}>Email</Text>
            <Text style={styles.tableColHeader}>Tipo</Text>
            <Text style={styles.tableColHeader}>Estado</Text>
            <Text style={styles.tableColHeader}>Inicio</Text>
            <Text style={styles.tableColHeader}>Fin</Text>
          </View>

          {/* Filas */}
          {memberships.length > 0 ? (
            memberships.map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCol}>{m.nombre} {m.apellido}</Text>
                <Text style={styles.tableCol}>{m.emailUsuario}</Text>
                <Text style={styles.tableCol}>{m.tipo}</Text>
                <Text style={styles.tableCol}>{m.estado}</Text>
                <Text style={styles.tableCol}>
                  {new Date(m.fechaInicio).toLocaleDateString("es-AR")}
                </Text>
                <Text style={styles.tableCol}>
                  {new Date(m.fechaFin).toLocaleDateString("es-AR")}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.tableCol, width: "100%" }}>
                No hay membresías registradas.
              </Text>
            </View>
          )}
        </View>

        
        <Text style={styles.footer}>
          © {new Date().getFullYear()} - NukeGym | Membresias
        </Text>
      </Page>
    </Document>
  );
}

export default PDF;
