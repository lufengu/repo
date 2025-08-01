import { Users, UserCheck, Store } from "lucide-react";

const CardEstadisticasAdmin = ({ usuarios }) => {
  // Cálculos de estadísticas
  const totalUsuarios = usuarios.length;
  const administradores = usuarios.filter(u => u.rol === 'Admin').length;
  const tenderos = usuarios.filter(u => u.rol === 'Tendero').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mt-4 md:mt-6 lg:mt-8">
      {/* Card Total Usuarios */}
      <div className="bg-white bg-opacity-90 p-4 md:p-5 lg:p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-gray-600 text-xs md:text-sm font-medium">Total Usuarios</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-orange-500">{totalUsuarios}</p>
      </div>

      {/* Card Administradores */}
      <div className="bg-white bg-opacity-90 p-4 md:p-5 lg:p-6 rounded-lg text-center border-2 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-gray-600 text-xs md:text-sm font-medium">Administradores</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-blue-500">{administradores}</p>
      </div>

      {/* Card Tenderos */}
      <div className="bg-white bg-opacity-90 p-4 md:p-5 lg:p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
            <Store className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-gray-600 text-xs md:text-sm font-medium">Tenderos</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-orange-500">{tenderos}</p>
      </div>
    </div>
  );
};

export default CardEstadisticasAdmin;