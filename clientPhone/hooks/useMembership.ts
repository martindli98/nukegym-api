import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";

export function useMembership() {
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionKey, setSessionKey] = useState("");

  useEffect(() => {
    const checkUserChange = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const user = await AsyncStorage.getItem("userData");

      const newKey = JSON.stringify({ token, user }); // HASH REAL
      setSessionKey(newKey);
    };

    checkUserChange();
  }, []);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        setLoading(true);

        const token = await AsyncStorage.getItem("authToken");
        const userDataStr = await AsyncStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;

        if (!token || !userData) {
          setMembership({ membershipActive: false, data: {} });
          return;
        }

        const role = userData.id_rol;

        if (role === 1 || role === 3) {
          setMembership({
            membershipActive: true,
            data: { tipo: "libre" },
          });
          return;
        }

        const res = await api("/membership/status");
        setMembership(res);
      } catch (err) {
        console.error("Error membership:", err);
        setMembership({ membershipActive: false });
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [sessionKey]);

  return { membership, loading };
}
