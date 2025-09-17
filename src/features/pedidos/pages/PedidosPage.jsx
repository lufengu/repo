import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import pedidosApi from '../services/pedidosApi';
import Menu from '../../dashboard/components/Menu';
import NuevoPedidoModal from '../components/NuevoPedidoModal';

function PedidosPage() {
  const [userName, setUserName] = useState('Usuario');
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.name || user.nombre || user.firstName || user.username || 'Usuario';
        setUserName(name);
      } catch (error) {
        setUserName('Usuario');
      }
    }
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('pedidos');
  const [search, setSearch] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPedido, setEditPedido] = useState(null);

  useEffect(() => {
    setLoading(true);
    pedidosApi.getPedidos()
      .then(data => {
        // Mapear los datos del backend a español
        const pedidosMapeados = Array.isArray(data)
          ? data.map(p => ({
              id: p.id,
              producto: p.product || '',
              proveedor: p.supplier || '',
              cantidad: p.quantity || '',
              fecha: p.date || '',
              estado: p.status || '',
              user_id: p.user_id || '',
            }))
          : [];
        setPedidos(pedidosMapeados);
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRecibido = async (id) => {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;
    const nuevoEstado = 'Recibido';
    try {
      await pedidosApi.updatePedido(id, { ...pedido, status: nuevoEstado });
      setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try {
      await pedidosApi.deletePedido(id);
      setPedidos(pedidos.filter(p => p.id !== id));
    } catch (e) {}
  };

  const handleEdit = (pedido) => {
    setEditPedido(pedido);
    setModalOpen(true);
  };

  const filteredPedidos = pedidos.filter(p =>
    (p.producto?.toLowerCase().includes(search.toLowerCase()) ||
    p.proveedor?.toLowerCase().includes(search.toLowerCase()))
  );

  // Función para formatear fecha a DD/MM/YYYY
  const formatFecha = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-row">
      {/* Menú fijo en escritorio */}
      <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white shadow-lg">
        <Menu
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
      {/* Botón flotante para abrir menú en móviles */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-brand-orange hover:bg-orange-500 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header superior */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 font-semibold text-lg sm:text-2xl md:text-[1.755rem]">¡Hola, {userName}!</p>
              <span className="text-gray-600 font-semibold text-lg sm:text-2xl md:text-[1.755rem]">Organiza tus pedidos, asegura tus ganancias</span>
            </div>
          </div>
        </header>
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
          <h1 className="ml-2 text-xl font-semibold text-gray-800">Pedidos</h1>
        </div>
        {/* Contenido principal de pedidos */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="font-bold text-2xl sm:text-3xl mb-2 text-black">Pedidos</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Visualiza y registra nuevos pedidos a proveedores</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
              <input
                type="text"
                placeholder="Buscar pedido..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="p-2 rounded-md border border-gray-300 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-brand-blue mb-2 sm:mb-0"
              />
              <button
                className="bg-brand-orange text-white rounded-md px-4 py-2 sm:px-6 sm:py-3 font-bold text-base sm:text-lg shadow hover:bg-orange-500 transition w-full sm:w-auto"
                onClick={() => setModalOpen(true)}
              >+ Nuevo Pedido</button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-[500px] w-full text-xs sm:text-sm md:text-base">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Producto</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Proveedor</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Cantidad</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPedidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">No hay pedidos para mostrar.</td>
                    </tr>
                  ) : (
                    filteredPedidos.map((p, idx) => (
                      <tr key={p.id || p._id || `${p.product || p.producto}-${p.supplier || p.proveedor}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">{p.product || p.producto}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">{p.supplier || p.proveedor}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">{p.quantity || p.cantidad}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">{formatFecha(p.date || p.fecha)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                            {p.status || p.estado}
                            {(p.status === 'Pendiente' || p.status === 'Retrasado' || p.estado === 'Pendiente' || p.estado === 'Retrasado') && (
                              <button
                                className="ml-2 px-2 sm:px-3 py-1 bg-brand-blue text-white rounded hover:bg-blue-700 transition text-xs sm:text-sm"
                                onClick={() => handleRecibido(p.id || p._id)}
                              >Recibido</button>
                            )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50"
                              title="Editar pedido"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id || p._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Eliminar pedido"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <NuevoPedidoModal
              open={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setEditPedido(null);
              }}
              pedido={editPedido}
              onCreate={async pedido => {
                const hoy = new Date();
                const fechaPedido = new Date(pedido.fecha);
                let status = pedido.estado || 'Pendiente';
                if (fechaPedido < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
                  status = 'Retrasado';
                }
                // Mapear los campos al formato backend
                const orderPayload = {
                  product: pedido.producto,
                  supplier: pedido.proveedor,
                  quantity: String(pedido.cantidad),
                  date: pedido.fecha,
                  status
                };
                if (editPedido) {
                  // Editar pedido existente
                  try {
                    await pedidosApi.updatePedido(editPedido.id, orderPayload);
                    setPedidos(prev => prev.map(p => p.id === editPedido.id ? { ...p, ...pedido, estado: status } : p));
                  } catch (e) {}
                } else {
                  // Crear nuevo pedido
                  try {
                    const res = await pedidosApi.createPedido(orderPayload);
                    setPedidos(prev => [...prev, { ...pedido, estado: status, id: res.pedidoId }]);
                  } catch (e) {}
                }
                setEditPedido(null);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PedidosPage;
