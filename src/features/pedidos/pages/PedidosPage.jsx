import React, { useState, useState as useReactState } from 'react';
import Menu from '../../dashboard/components/Menu';
import NuevoPedidoModal from '../components/NuevoPedidoModal';

// Aquí se conectará con la API para obtener los pedidos

function PedidosPage() {
  const [userName, setUserName] = useReactState('Usuario');
  React.useEffect(() => {
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
  const [sidebarOpen, setSidebarOpen] = useReactState(true);
  const [activeSection, setActiveSection] = useReactState('pedidos');
  const [search, setSearch] = useReactState('');
  const [pedidos, setPedidos] = useReactState([]); // Se inicializa vacío, listo para API
  const [modalOpen, setModalOpen] = useReactState(false);

  // El botón 'Recibido' elimina el estado
  const handleRecibido = (id) => {
    setPedidos(pedidos.map(p => {
      if (p.id !== id) return p;
      if (p.estado === 'Pendiente' || p.estado === 'Retrasado') return { ...p, estado: '' };
      return p;
    }));
  };

  const handleDelete = (id) => {
    setPedidos(pedidos.filter(p => p.id !== id));
  };

  const filteredPedidos = pedidos.filter(p =>
    (p.producto?.toLowerCase().includes(search.toLowerCase()) ||
    p.proveedor?.toLowerCase().includes(search.toLowerCase()))
  );

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
      {/* Botón para abrir menú en móviles */}
      {/* Puedes agregar aquí el botón de menú móvil si lo necesitas */}
      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>¡Hola, {userName}!</p>
              <span className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>Organiza tus pedidos, asegura tus ganancias</span>
            </div>
          </div>
        </header>
        {/* Contenido principal de pedidos */}
  <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="font-bold text-3xl mb-2 text-black">Pedidos</h2>
            <p className="text-gray-600 mb-6">Visualiza y registra nuevos pedidos a proveedores</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="p-2 rounded-md border border-gray-300 w-80 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button
              className="bg-brand-orange text-white rounded-md px-6 py-3 font-bold text-lg shadow hover:bg-orange-500 transition"
              onClick={() => setModalOpen(true)}
            >+ Nuevo Pedido</button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                  <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Pedido</th>
                  <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Cantidad</th>
                  <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No hay pedidos para mostrar.</td>
                  </tr>
                ) : (
                  filteredPedidos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold text-brand-orange">{p.producto}</div>
                          <div className="text-base text-gray-500">{p.proveedor}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-base font-semibold rounded-full bg-ios-blue-pastel text-brand-blue">{p.cantidad}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-base font-semibold rounded-full bg-ios-blue-pastel text-brand-blue">
                          {(() => {
                            if (!p.fecha) return '';
                            const hoy = new Date();
                            const fechaPedido = new Date(p.fecha);
                            // Normalizar a solo fecha (sin hora)
                            hoy.setHours(0,0,0,0);
                            fechaPedido.setHours(0,0,0,0);
                            const diff = (fechaPedido - hoy) / (1000 * 60 * 60 * 24);
                            if (diff === 0) return 'hoy';
                            if (diff === 1) return 'mañana';
                            return p.fecha;
                          })()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {p.estado === 'Pendiente' && (
                          <span className="inline-flex px-2 py-1 text-base font-semibold rounded-full bg-brand-orange-light text-brand-orange mr-2">Pendiente</span>
                        )}
                        {p.estado === 'Retrasado' && (
                          <span className="inline-flex px-2 py-1 text-base font-semibold rounded-full bg-red-100 text-red-500 mr-2">Retrasado</span>
                        )}
                        <button
                          className="bg-brand-blue text-white rounded-md px-4 py-1 font-bold text-base cursor-pointer ml-2"
                          onClick={() => handleRecibido(p.id)}
                        >Recibido</button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          className="bg-transparent border-none text-brand-orange text-2xl mr-2 cursor-pointer hover:scale-110 transition"
                          title="Editar"
                        >&#9998;</button>
                        <button
                          className="bg-transparent border-none text-red-500 text-2xl cursor-pointer hover:scale-110 transition"
                          title="Eliminar"
                          onClick={() => handleDelete(p.id)}
                        >&#128465;</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <NuevoPedidoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={pedido => {
            const hoy = new Date();
            const fechaPedido = new Date(pedido.fecha);
            let estado = 'Pendiente';
            if (fechaPedido < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
              estado = 'Retrasado';
            }
            setPedidos(prev => [...prev, { ...pedido, estado, id: Date.now() }]);
          }}
        />
        </main>
      </div>
    </div>
  );
}

export default PedidosPage;
