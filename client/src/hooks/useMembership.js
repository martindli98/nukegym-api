import { useEffect, useState } from "react";
import axios from "axios";

export function useMembership() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    axios
      .get("http://localhost:3000/api/membership/status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const role = JSON.parse(sessionStorage.getItem("userData"))?.userData
          ?.id_rol;

        if (role === 1 || role === 3) {
          setMembership({
            success: true,
            membershipActive: true,
            data: { tipo: "libre" },
          });
        } else {
          setMembership(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { membership, loading };
}
