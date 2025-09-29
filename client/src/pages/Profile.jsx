import React from "react";
import Header from "../components/Header";
import ProfileCard from "../components/Profile/ProfileCard";
import useUserProfile from "../hooks/useUserProfile";

function Profile() {
  const { userData, loading, error, refetch } = useUserProfile();

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">Cargando perfil...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="text-xl text-red-600 mb-4">
              Error al cargar el perfil
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={refetch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Reintentar
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Ir a Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProfileCard userData={userData} onProfileUpdate={refetch} />
    </div>
  );
}

export default Profile;
