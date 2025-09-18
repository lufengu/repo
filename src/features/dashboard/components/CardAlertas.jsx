import { AlertCircleIcon, TruckIcon, ClockAlertIcon, CalendarClockIcon, CircleXIcon, ShieldAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getInventory } from "../../../services/inventoryService";
import { salesAPI } from "../../ventas/services/salesService";
import pedidosApi from "../../pedidos/services/pedidosApi";

const CardAlertas = () => {
  const [showModal, setShowModal] = useState(false);
  const [productosPorVencer, setProductosPorVencer] = useState([]);
  const [productosVencidos, setProductosVencidos] = useState([]);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pedidosRetrasados, setPedidosRetrasados] = useState([]);

  useEffect(() => {
    async function fetchAlertas() {
      setLoading(true);
      try {
        // Productos por vencer 
        const inventario = await getInventory();
        const hoy = new Date();
        const porVencer = [];
        const vencidos = [];
        inventario.forEach(item => {
          const fecha = item.expirationDate || item.expiration_date;
          if (!fecha) return;
            const fechaVenc = new Date(fecha);
            const diff = (fechaVenc - hoy) / (1000 * 60 * 60 * 24);
            if (diff < 0) {
              vencidos.push(item);
            } else if (diff <= 7) {
              porVencer.push(item);
            }
        });
        setProductosPorVencer(porVencer);
        setProductosVencidos(vencidos);

        // Pedidos retrasados
        const pedidos = await pedidosApi.getPedidos();
        // Mapear los datos del backend a español
        const pedidosMapeados = Array.isArray(pedidos)
          ? pedidos.map(p => ({
              id: p.id,
              producto: p.product || '',
              proveedor: p.supplier || '',
              cantidad: p.quantity || '',
              fecha: p.date || '',
              estado: p.status || '',
              user_id: p.user_id || '',
            }))
          : [];
        const retrasados = pedidosMapeados.filter(p => p.estado === 'Retrasado');
        setPedidosRetrasados(retrasados);

        // Ventas de hoy
        const ventas = await salesAPI.getSales();
        const formatDate = d => {
          if (!d) return '';
          const dateObj = new Date(d);
          if (typeof d === 'string' && d.length === 10 && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return d;
          }
          return dateObj.toISOString().slice(0, 10);
        };
        const hoyStr = formatDate(hoy);
        const ventasHoyCount = ventas.filter(v => {
          const ventaStr = formatDate(v.date || v.createdAt);
          return ventaStr === hoyStr;
        }).length;
        setVentasHoy(ventasHoyCount);
      } catch (err) {
        // Fallback en caso de error al cargar alertas
        console.error('Error cargando alertas:', err);
        setProductosPorVencer([]);
        setProductosVencidos([]);
        setVentasHoy(0);
        setPedidosRetrasados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertas();
  }, []);

  // Pedidos retrasados
  const retrasosPedidos = pedidosRetrasados.length > 0;

  // Handlers acciones rápidas (placeholders)
  const handleVerInventario = () => {
    console.log('Ver inventario productos por vencer');
  };

  return (
  <>
  <div
    className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer"
    onClick={() => setShowModal(true)}
  >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
            <AlertCircleIcon className="w-4 h-4 text-red-600" />
          </div>
          <h2 className="font-semibold text-red-700">Alertas Importantes</h2>
        </div>
        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">¡Atención!</span>
      </div>
      <div className="mt-2 space-y-3 text-sm">
        {loading ? (
          <div className="bg-white rounded-lg p-3 text-gray-500 shadow">Cargando alertas...</div>
        ) : (
          <>
            {/* Retrasos de pedidos */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <span><AlertCircleIcon className="w-4 h-4 text-red-500" /></span>
              <span className="font-semibold">Retrasos de pedidos:</span>
              <span className="text-gray-700">{pedidosRetrasados.length === 0 ? 'No hay pedidos retrasados.' : `${pedidosRetrasados.length} pedido${pedidosRetrasados.length !== 1 ? 's' : ''} retrasado${pedidosRetrasados.length !== 1 ? 's' : ''}`}</span>
            </div>
            {/* Productos vencidos y próximos a vencer (combinado) */}
            <div
              className={
                productosVencidos.length > 0
                  ? 'bg-red-100 border border-red-300 rounded-lg p-3 flex flex-col gap-1'
                  : productosPorVencer.length > 0
                    ? 'bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col gap-1'
                    : 'bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-1'
              }
            >
              <div className="flex items-center gap-2">
                <span>
                  <AlertCircleIcon
                    className={
                      productosVencidos.length > 0
                        ? 'w-4 h-4 text-red-600'
                        : productosPorVencer.length > 0
                          ? 'w-4 h-4 text-orange-500'
                          : 'w-4 h-4 text-gray-500'
                    }
                  />
                </span>
                <span className={
                  productosVencidos.length > 0
                    ? 'font-semibold text-red-700'
                    : productosPorVencer.length > 0
                      ? 'font-semibold text-orange-600'
                      : 'font-semibold text-gray-600'
                }>Productos vencidos y próximos a vencer:</span>
              </div>
              <div className="text-gray-800 text-sm">
                {productosVencidos.length === 0 && productosPorVencer.length === 0 && 'No hay productos vencidos ni próximos a vencer.'}
                {productosVencidos.length > 0 && productosPorVencer.length === 0 && (
                  `${productosVencidos.length} producto${productosVencidos.length !== 1 ? 's' : ''} vencido${productosVencidos.length !== 1 ? 's' : ''}.`
                )}
                {productosVencidos.length === 0 && productosPorVencer.length > 0 && (
                  `${productosPorVencer.length} producto${productosPorVencer.length !== 1 ? 's' : ''} vence${productosPorVencer.length !== 1 ? 'n' : ''} en menos de 7 días.`
                )}
                {productosVencidos.length > 0 && productosPorVencer.length > 0 && (
                  `${productosVencidos.length} vencido${productosVencidos.length !== 1 ? 's' : ''} y ${productosPorVencer.length} por vencer (<=7 días).`
                )}
              </div>
            </div>
            {/* Ventas de hoy */}
            <div className={ventasHoy === 0 ? "bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2" : "bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"}>
              <span className={ventasHoy === 0 ? "text-red-500" : "text-green-600"}><AlertCircleIcon className="w-4 h-4" /></span>
              <span className="font-medium">{ventasHoy === 0 ? "Hoy no se ha registrado ninguna venta." : "Hoy ya se registró ventas. ¡Buen trabajo!"}</span>
            </div>
          </>
        )}
      </div>
    </div>
    {/* Modal de alertas */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div role="dialog" aria-modal="true" aria-labelledby="alertas-title" className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-[fadeIn_.25s_ease-out]">
          <div className="relative border-b px-8 py-5 flex items-center justify-between">
            <h3 id="alertas-title" className="text-2xl font-bold text-red-700 flex items-center gap-3">
              <AlertCircleIcon className="w-7 h-7 text-red-500" /> Alertas Importantes
            </h3>
            <button aria-label="Cerrar" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded p-1">
              ×
            </button>
          </div>
          <div className="px-8 py-6 overflow-y-auto space-y-10">
            {/* Sección pedidos retrasados */}
            <section aria-labelledby="sec-pedidos-retrasados" className="group">
              <header className="flex items-center gap-2 mb-3">
                <ClockAlertIcon className="w-5 h-5 text-amber-600" />
                <h4 id="sec-pedidos-retrasados" className="text-lg font-medium text-amber-700 tracking-tight">Pedidos retrasados</h4>
              </header>
              {retrasosPedidos ? (
                <ul className="space-y-3">
                  {pedidosRetrasados.map((p, idx) => {
                    const hoy = new Date();
                    const fechaPedido = new Date(p.fecha);
                    hoy.setHours(0,0,0,0);
                    fechaPedido.setHours(0,0,0,0);
                    const diff = Math.abs(Math.round((hoy - fechaPedido) / (1000 * 60 * 60 * 24)));
                    return (
                      <li key={p.id || idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b last:border-b-0 pb-3">
                        <span className="font-semibold text-amber-700">{p.producto}</span>
                        <span className="text-gray-700">Retrasado {diff} día{diff !== 1 ? 's' : ''}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-600">No hay pedidos retrasados.</p>
              )}
            </section>
            {/* Sección productos vencidos */}
            <section aria-labelledby="sec-productos-vencidos">
              <header className="flex items-center gap-2 mb-3">
                <CircleXIcon className="w-5 h-5 text-red-600" />
                <h4 id="sec-productos-vencidos" className="text-lg font-medium text-red-700 tracking-tight">Productos vencidos</h4>
              </header>
              {productosVencidos.length === 0 ? (
                <p className="text-gray-600">No hay productos vencidos.</p>
              ) : (
                <ul className="space-y-3">
                  {productosVencidos.map((prod, idx) => (
                    <li key={prod.id || prod._id || idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b last:border-b-0 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-red-700">{prod.name || prod.nombre}</span>
                        {(prod.expirationDate || prod.expiration_date) && (
                          <span className="text-gray-700 text-sm">Venció: {new Date(prod.expirationDate || prod.expiration_date).toLocaleDateString()}</span>
                        )}
                        {prod.lote && <span className="text-gray-500 text-sm">Lote: {prod.lote}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {/* Sección productos por vencer */}
            <section aria-labelledby="sec-productos-por-vencer">
              <header className="flex items-center gap-2 mb-3">
                <CalendarClockIcon className="w-5 h-5 text-orange-600" />
                <h4 id="sec-productos-por-vencer" className="text-lg font-medium text-orange-600 tracking-tight">Productos próximos a vencer</h4>
              </header>
              {productosPorVencer.length === 0 ? (
                <p className="text-gray-600">No hay productos próximos a vencer.</p>
              ) : (
                <>
                  <ul className="space-y-3 mb-3">
                    {productosPorVencer.map((prod, idx) => (
                      <li key={prod.id || prod._id || idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b last:border-b-0 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-orange-700">{prod.name || prod.nombre}</span>
                          {prod.expirationDate || prod.expiration_date ? (
                            <span className="text-gray-700 text-sm">Vence: {new Date(prod.expirationDate || prod.expiration_date).toLocaleDateString()}</span>
                          ) : null}
                          {prod.lote && <span className="text-gray-500 text-sm">Lote: {prod.lote}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleVerInventario} aria-label="Ver inventario productos por vencer" className="text-blue-600 text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1">Ver inventario</button>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CardAlertas;
