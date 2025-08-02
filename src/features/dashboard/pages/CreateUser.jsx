import { useState } from "react";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import AdminMenu from "../components/AdminMenu";
import CreateUserForm from "../components/CreateUserForm";

const CreateUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('users');

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu lateral para admin */}
      <AdminMenu 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con botón móvil */}
        <header className="bg-white shadow-sm p-3 md:p-4 flex justify-between items-center border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Crear Usuario</h1>
        </header>

        {/* Header con fondo - Responsivo (estilo brand-blue) */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white" style={{background: 'linear-gradient(to right, #007AFF, #0056CC)'}}>
          <div className="p-4 md:p-6">
            <div className="flex items-center mb-4">
              <button 
                onClick={handleGoBack}
                className="mr-4 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold">
                Crear Nuevo Usuario
              </h1>
            </div>
            <p className="opacity-90">
              Completa el formulario para registrar un nuevo usuario en el sistema
            </p>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <CreateUserForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
