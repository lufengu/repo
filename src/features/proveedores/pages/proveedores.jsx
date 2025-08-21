import React, { useState, useEffect } from "react";
import { getProviders, createProvider, deleteProvider } from '../services/providerService';
import { useAuth } from "../../auth/context/AuthContext";
import { FaWhatsapp, FaRegBuilding, FaSearch, FaTrashAlt } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";
import { useProductos } from '../../../hooks/useProductos';

export default function ProveedoresPage() {
  const { productos } = useProductos();
  // Filtrar productos por agotarse (stock <= 50)
  const productosPorAgotarse = productos.filter(p => p.stock <= 50);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("proveedores");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombreProveedor: "",
    nombreEncargado: "",
    whatsapp: "",
    correo: "",
    direccion: "",
    imagen: null,
  });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Cargar proveedores reales del backend
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const data = await getProviders();
        // Adaptar los datos del backend al formato de las cards
        setCards(
          data.map((prov) => ({
            id: prov.id,
            img: null, // Si tienes imágenes, cámbialo aquí
            title: prov.title,
            desc: `Encargado: ${prov.ownerName}\nWhatsApp: ${prov.whatsappNumber}\nCorreo: ${prov.email}\nDirección: ${prov.address}`,
          }))
        );
        setError(null);
      } catch (err) {
        setError('Error al cargar proveedores');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);
  const [showOrdenar, setShowOrdenar] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(productosPorAgotarse[0]?.nombre || "");
  const [cantidad, setCantidad] = useState(1);
  const [unidad, setUnidad] = useState("unidades");
  const { user } = useAuth();
  // Función para obtener el nombre del usuario dinámicamente
  const getUserName = () =>
    user && (user.name || user.nombre || user.firstName || user.username)
      ? (user.name || user.nombre || user.firstName || user.username)
      : "Usuario";
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      setForm({ ...form, imagen: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Crear proveedor usando la API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nuevoProveedor = {
        title: form.nombreProveedor,
        ownerName: form.nombreEncargado,
        whatsappNumber: form.whatsapp,
        email: form.correo,
        address: form.direccion,
        // Puedes agregar más campos si tu backend los requiere
      };
      const creado = await createProvider(nuevoProveedor);
      setCards([
        {
          id: creado.id,
          img: null, // Si tienes imágenes, cámbialo aquí
          title: creado.title,
          desc: `Encargado: ${creado.ownerName}\nWhatsApp: ${creado.whatsappNumber}\nCorreo: ${creado.email}\nDirección: ${creado.address}`,
        },
        ...cards,
      ]);
      setForm({
        nombreProveedor: "",
        nombreEncargado: "",
        whatsapp: "",
        correo: "",
        direccion: "",
        imagen: null,
      });
      handleCloseModal();
    } catch (err) {
      alert('Error al crear proveedor');
    }
  };

  // Abrir modal de ordenar
  const handleOpenOrdenar = (card) => {
    setProveedorSeleccionado(card);
    setProductoSeleccionado(productosPorAgotarse[0]?.nombre || "");
    setCantidad(1);
    setUnidad(productosPorAgotarse[0]?.unidadMedida || "unidades");
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir 1 ${productosPorAgotarse[0]?.unidadMedida || "unidades"} de ${productosPorAgotarse[0]?.nombre}. ¿Qué precio tendría ese pedido?`
    );
    setShowOrdenar(true);
  };

  // Actualizar mensaje
  const handleProductoChange = (e) => {
    const prod = productosPorAgotarse.find(p => p.nombre === e.target.value);
    setProductoSeleccionado(e.target.value);
    setUnidad(prod?.unidadMedida || "unidades");
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${cantidad} ${prod?.unidadMedida || "unidades"} de ${e.target.value}. ¿Qué precio tendría ese pedido?`
    );
  };
  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${e.target.value} ${unidad} de ${productoSeleccionado}. ¿Qué precio tendría ese pedido?`
    );
  };
  const handleUnidadChange = (e) => {
    setUnidad(e.target.value);
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${cantidad} ${e.target.value} de ${productoSeleccionado}. ¿Qué precio tendría ese pedido?`
    );
  };

  const handleCloseOrdenar = () => {
    setShowOrdenar(false);
    setProveedorSeleccionado(null);
  };

  const handleEnviarWhatsApp = () => {
    if (!proveedorSeleccionado) return;
    const match = proveedorSeleccionado.desc.match(/WhatsApp: ([^\n]+)/i);
    const numero = match ? match[1].replace(/\s+/g, "") : "";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };


  // Nueva función para eliminar proveedor
  // Eliminar proveedor usando la API
  const handleEliminarProveedor = async (idx) => {
    const proveedor = cards[idx];
    if (!proveedor.id) {
      // Si no tiene id, es un proveedor local (no debería pasar)
      setCards(cards.filter((_, i) => i !== idx));
      return;
    }
    if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
      try {
        await deleteProvider(proveedor.id);
        setCards(cards.filter((_, i) => i !== idx));
      } catch (err) {
        alert('Error al eliminar proveedor');
      }
    }
  };

  // Filtrar proveedores según búsqueda
  const cardsFiltradas = cards.filter(card =>
    card.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Menú fijo en escritorio */}
      <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white shadow-lg">
        <Menu
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
      {/* Botón para abrir menú en móviles */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Drawer menú en móviles */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="relative w-64 bg-white shadow-xl h-full">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-50"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              ×
            </button>
            <Menu
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          {/* Fondo oscuro para cerrar el menú */}
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <div className="flex-1 px-2 py-4 sm:px-4 md:p-8 w-full">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1">
            <FaRegBuilding className="text-2xl sm:text-3xl text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Proveedores</h1>
          </div>
          <p className="text-gray-500 mb-2 sm:mb-4 text-sm sm:text-base">Administra la información de contacto y configuración de proveedores</p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar proveedor..."
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow w-full sm:w-auto"
              onClick={handleOpenModal}
            >
              + Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Modal para nuevo proveedor */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseModal}
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">Registrar nuevo proveedor</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre de la empresa o proveedor</label>
                  <input
                    type="text"
                    name="nombreProveedor"
                    value={form.nombreProveedor}
                    onChange={handleInputChange}
                    placeholder="Ej: Distribuidora Central S.A."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre de la persona encargada</label>
                  <input
                    type="text"
                    name="nombreEncargado"
                    value={form.nombreEncargado}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Número de WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Ej: +34 600 123 456"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleInputChange}
                    placeholder="Ej: pedidos@proveedor.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle Principal 123, Ciudad"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Subir imagen (opcional)</label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  <span className="text-xs text-gray-400">Formatos: JPG, PNG, SVG. Máx 2MB.</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                  >
                    Guardar proveedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-16 justify-center">
          {cardsFiltradas.map((card, idx) => (
            <div
              key={idx}
              className="relative flex flex-col w-full sm:w-80 rounded-xl bg-gradient-to-br from-white to-gray-50 bg-clip-border text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-6 sm:mb-8 mx-auto"
            >
              <div className="relative mx-2 sm:mx-4 -mt-6 h-36 sm:h-40 overflow-hidden rounded-xl shadow-lg group">
                {card.img ? (
                  <img
                    src={card.img}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 text-3xl sm:text-4xl font-bold">?</div>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <h5 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                  {card.title}
                </h5>
                <p className="text-sm sm:text-base font-light text-gray-700 whitespace-pre-line break-words">
                  {card.desc}
                </p>
              </div>
              <div className="p-4 sm:p-6 pt-0 flex flex-row gap-3 w-full">
                <button
                  className="flex-1 flex items-center justify-center px-0 py-3 font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  onClick={() => handleOpenOrdenar(card)}
                  style={{ minWidth: 0 }}
                >
                  <span className="flex items-center gap-2">
                    Ordenar
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-5 h-5 transform transition-transform group-hover:translate-x-1">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                    </svg>
                  </span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center px-0 py-3 font-bold text-white rounded-lg bg-orange-500 hover:bg-orange-600 shadow-lg transition-all duration-300 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                  onClick={() => handleEliminarProveedor(idx)}
                  style={{ minWidth: 0 }}
                >
                  <FaTrashAlt className="mr-2 text-base group-hover:animate-bounce transition-transform duration-300" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal global para ordenar productos */}
        {showOrdenar && proveedorSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseOrdenar}
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">Ordenar producto</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Escoge el producto</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={productoSeleccionado}
                  onChange={handleProductoChange}
                >
                  {productosPorAgotarse.map((prod, idx) => (
                    <option key={idx} value={prod.nombre}>{prod.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Unidad de medida</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={unidad}
                  onChange={handleUnidadChange}
                >
                  <option value="unidades">unidades</option>
                  <option value="cajas">cajas</option>
                  <option value="paquetes">paquetes</option>
                  <option value="litros">litros</option>
                  <option value="kilos">kilos</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={cantidad}
                  onChange={handleCantidadChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Mensaje</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                />
              </div>
              <div className="flex justify-center">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
                  onClick={handleEnviarWhatsApp}
                  type="button"
                >
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}