import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaClock, FaEdit } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";

const proveedores = [
  {
    nombre: "Distribuidora Central S.A.",
    contacto: "Juan Pérez",
    telefono: "+34 91 123 4567",
    email: "juan.perez@distribuidora.com",
    whatsapp: "+34 91 123 4567",
    direccion: "Av. Principal 123, Madrid",
    entrega: "3 días de entrega",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    activo: true,
  },
  {
    nombre: "Suministros Industriales López",
    contacto: "María García",
    telefono: "+34 93 987 6543",
    email: "maria.garcia@suministros.com",
    whatsapp: "+34 93 987 6543",
    direccion: "Calle Industrial 45, Barcelona",
    entrega: "5 días de entrega",
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    activo: true,
  },
  {
    nombre: "Proveedora del Sur",
    contacto: "Carlos Ruiz",
    telefono: "+34 95 456 7890",
    email: "carlos.ruiz@provsur.com",
    direccion: "Plaza Mayor 12, Sevilla",
    entrega: "7 días de entrega",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    activo: true,
  },
];

export default function ProveedoresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("proveedores");
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-1">Gestión de Proveedores</h1>
        <p className="text-gray-500 mb-8">Administra la información de contacto y configuración de proveedores</p>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow">+ Nuevo Proveedor</button>
        </div>
        <div className="flex flex-wrap gap-6">
          {proveedores.map((prov, idx) => (
            <div
              key={idx}
              className={`w-full md:w-80 border ${prov.color} rounded-xl p-6 shadow-sm flex flex-col gap-2 relative`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-semibold ${prov.iconColor}`}>{prov.nombre}</span>
                {prov.activo && (
                  <span className="ml-2 bg-black text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">Activo</span>
                )}
                <FaEdit className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" title="Editar" />
              </div>
              <div className="text-gray-600 text-sm mb-2">{prov.contacto}</div>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <FaPhone className={prov.iconColor} /> {prov.telefono}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <FaEnvelope className={prov.iconColor} /> {prov.email}
              </div>
              {prov.whatsapp && (
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaWhatsapp className={prov.iconColor} /> {prov.whatsapp}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <FaMapMarkerAlt className={prov.iconColor} /> {prov.direccion}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <FaClock className={prov.iconColor} /> {prov.entrega}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}