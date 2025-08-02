import { useState } from "react";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import Menu from "../components/Menu";
import CreateUserForm from "../components/CreateUserForm";

const CreateUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('create-user');

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu lateral */}
      <Menu 
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

        {/* Header con fondo - Responsivo */}
        <div 
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-4 md:p-6 lg:p-8"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:%23667eea;stop-opacity:1" /><stop offset="100%" style="stop-color:%23764ba2;stop-opacity:1" /></linearGradient></defs><rect width="1000" height="300" fill="url(%23grad)"/></svg>')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <button 
                onClick={handleGoBack}
                className="mr-4 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Crear Nuevo Usuario
              </h1>
            </div>
            <p className="text-lg md:text-xl opacity-90">
              Completa el formulario para registrar un nuevo usuario en el sistema
            </p>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <CreateUserForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
