import React, { useState, useEffect } from 'react';
import Menu from '../../dashboard/components/Menu';
import CardProductosBajos from '../../dashboard/components/CardProductosBajos';
import TendenciaInventario from '../components/TendenciaInventario';
import ProductosPorCategoria from '../components/ProductosPorCategoria';
import HeaderInventario from '../components/HeaderInventario';
import FiltrosInventario from '../components/FiltrosInventario';
import TablaProductos from '../components/TablaProductos';
import PaginacionInventario from '../components/PaginacionInventario';
import ModalAgregarProducto from '../components/ModalAgregarProducto';
import ModalEditarProducto from '../components/ModalEditarProducto';
import ModalEliminarProducto from '../components/ModalEliminarProducto';
import { useProductos } from '../../../hooks/useProductos';

const Inventario = () => {
  // Estados
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(5);
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Hook de productos
  const { productos, loading, error, agregarProducto, editarProducto, eliminarProducto } = useProductos();

  // Cálculos derivados
  const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))];
  // Usar el mismo criterio que CardProductosBajos
  const productosStockBajo = productos.filter(
    p => typeof p.umbralAlerta === 'number' ? p.stock <= p.umbralAlerta : p.stock < 100
  ).length;

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosActuales = productosFiltrados.slice(indiceInicio, indiceFin);

  // Funciones
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('Todas');
  };

  const handleAgregarProducto = () => {
    setModalAgregarOpen(true); // Abrir modal
  };

  const handleConfirmarAgregarProducto = async (nuevoProducto) => {
    try {
      await agregarProducto(nuevoProducto);
      console.log('Producto agregado exitosamente:', nuevoProducto);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  const handleEditarProducto = async (producto) => {
    setProductoSeleccionado(producto);
    setModalEditarOpen(true);
  };

  const handleConfirmarEditarProducto = async (productoEditado) => {
    try {
      await editarProducto(productoEditado.id, productoEditado);
      console.log('Producto editado exitosamente:', productoEditado);
    } catch (error) {
      console.error('Error al editar producto:', error);
      throw error;
    }
  };

  const handleEliminarProducto = async (producto) => {
    setProductoSeleccionado(producto);
    setModalEliminarOpen(true);
  };

  const handleConfirmarEliminarProducto = async (id) => {
    try {
      await eliminarProducto(id);
      console.log('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  };

  const handleVerProductosBajos = () => {
    setBusqueda('');
    setCategoriaFiltro('Todas');
    console.log('Mostrar productos con stock bajo');
  };

  // Efectos
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaFiltro]);

    return (
      <div className="min-h-screen bg-gray-100 flex flex-row">
        {/* Menú fijo en escritorio */}
  <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white no-shadow-menu">
          <Menu
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeSection="inventario"
            setActiveSection={() => {}}
          />
        </div>
        {/* Botón para abrir menú en móviles */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg focus:outline-none"
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
                activeSection="inventario"
                setActiveSection={() => {}}
              />
            </div>
            <div className="flex-1 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header móvil */}
          <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
            <h1 className="ml-2 text-xl font-semibold text-gray-800">Inventario</h1>
          </div>
          {/* Contenido del inventario */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {/* Loading */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando productos...</span>
                </div>
              )}
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar inventario</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Contenido normal cuando no hay loading ni error */}
              {!loading && !error && (
                <>
                  {/* Header */}
                  <HeaderInventario 
                    productosStockBajo={productosStockBajo}
                    onVerProductosBajos={handleVerProductosBajos}
                  />
                  {/* Cards de estadísticas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <CardProductosBajos productos={productos} />
                    <TendenciaInventario productos={productos} />
                    <ProductosPorCategoria productos={productos} />
                  </div>
                  {/* Filtros y búsqueda */}
                  <FiltrosInventario
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    productosPorPagina={productosPorPagina}
                    setProductosPorPagina={setProductosPorPagina}
                    setPaginaActual={setPaginaActual}
                    onAgregarProducto={handleAgregarProducto}
                  />
                  {/* Tabla de productos */}
                  <div className="space-y-0">
                    <TablaProductos
                      productosActuales={productosActuales}
                      categorias={categorias}
                      categoriaFiltro={categoriaFiltro}
                      setCategoriaFiltro={setCategoriaFiltro}
                      onEditarProducto={handleEditarProducto}
                      onEliminarProducto={handleEliminarProducto}
                      onLimpiarFiltros={handleLimpiarFiltros}
                    />
                    {/* Paginación */}
                    <PaginacionInventario
                      paginaActual={paginaActual}
                      totalPaginas={totalPaginas}
                      indiceInicio={indiceInicio}
                      indiceFin={indiceFin}
                      totalProductos={productosFiltrados.length}
                      categoriaFiltro={categoriaFiltro}
                      irAPaginaAnterior={irAPaginaAnterior}
                      irAPaginaSiguiente={irAPaginaSiguiente}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Modal Agregar Producto */}
        <ModalAgregarProducto
          isOpen={modalAgregarOpen}
          onClose={() => setModalAgregarOpen(false)}
          onAgregarProducto={handleConfirmarAgregarProducto}
          categorias={categorias}
        />
        {/* Modal Editar Producto */}
        <ModalEditarProducto
          isOpen={modalEditarOpen}
          onClose={() => setModalEditarOpen(false)}
          onEditarProducto={handleConfirmarEditarProducto}
          producto={productoSeleccionado}
          categorias={categorias}
        />
        {/* Modal Eliminar Producto */}
        <ModalEliminarProducto
          isOpen={modalEliminarOpen}
          onClose={() => setModalEliminarOpen(false)}
          onEliminarProducto={handleConfirmarEliminarProducto}
          producto={productoSeleccionado}
        />
      </div>
  );
};

export default Inventario;