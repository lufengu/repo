import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getInventory } from "../../../services/inventoryService";
import { salesAPI } from "../../ventas/services/salesService";
import pedidosApi from "../../pedidos/services/pedidosApi";

const CardAlertas = () => {
  const [showModal, setShowModal] = useState(false);
  const [productosPorVencer, setProductosPorVencer] = useState([]);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pedidosRetrasados, setPedidosRetrasados] = useState([]);

  useEffect(() => {
    async function fetchAlertas() {
      setLoading(true);
      try {
        // Productos por vencer (menos de 7 días)
        const inventario = await getInventory();
        const hoy = new Date();
        const porVencer = inventario.filter(item => {
          if (!item.expirationDate && !item.expiration_date) return false;
          const fechaVenc = new Date(item.expirationDate || item.expiration_date);
          const diff = (fechaVenc - hoy) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;
        });
        setProductosPorVencer(porVencer);

        // Pedidos retrasados
        const pedidos = await pedidosApi.getPedidos();
        const retrasados = pedidos.filter(p => p.estado === 'Retrasado');
        setPedidosRetrasados(retrasados);

        // Ventas de hoy
        const ventas = await salesAPI.getSales();
        // Normalizar fechas a 'YYYY-MM-DD' para comparar correctamente
        const formatDate = d => {
          if (!d) return '';
          const dateObj = new Date(d);
          // Si el string es 'YYYY-MM-DD', usarlo directamente
          if (typeof d === 'string' && d.length === 10 && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return d;
          }
          // Si es Date, formatear a 'YYYY-MM-DD'
          return dateObj.toISOString().slice(0, 10);
        };
        const hoyStr = formatDate(hoy);
        const ventasHoyCount = ventas.filter(v => {
          const ventaStr = formatDate(v.date || v.createdAt);
          return ventaStr === hoyStr;
        }).length;
        setVentasHoy(ventasHoyCount);
      } catch (err) {
        setProductosPorVencer([]);
        setVentasHoy(0);
        setPedidosRetrasados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertas();
  }, []);

  // Hay pedidos retrasados
  const retrasosPedidos = pedidosRetrasados.length > 0;

  return (
  <>
  <div className="bg-gradient-to-br from-red-50 via-orange-50 to-green-50 p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setShowModal(true)}>
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
            {/* Retrasos de pedidos: estilo caja igual que ventas */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <span><AlertCircleIcon className="w-4 h-4 text-red-500" /></span>
              <span className="font-semibold">Retrasos de pedidos:</span>
              <span className="text-gray-700">{pedidosRetrasados.length === 0 ? 'No hay pedidos retrasados.' : `${pedidosRetrasados.length} pedido${pedidosRetrasados.length !== 1 ? 's' : ''} retrasado${pedidosRetrasados.length !== 1 ? 's' : ''}`}</span>
            </div>
            {/* Productos por vencer: estilo caja igual que ventas */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
              <span><AlertCircleIcon className="w-4 h-4 text-orange-500" /></span>
              <span className="font-semibold">Productos por vencer:</span>
              <span className="text-gray-700">{productosPorVencer.length === 0 ? 'No hay productos próximos a vencer.' : `${productosPorVencer.length} producto${productosPorVencer.length !== 1 ? 's' : ''} vencen en menos de 7 días.`}</span>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-2xl min-h-[450px] max-h-[700px] overflow-y-auto relative flex flex-col">
          <button className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowModal(false)}>&times;</button>
          <h3 className="text-2xl font-bold mb-8 text-red-700 flex items-center gap-3"><AlertCircleIcon className="w-7 h-7 text-red-500" /> Alertas Importantes</h3>
          {/* Pedidos retrasados */}
          <div className="mb-8">
            <h4 className="font-semibold text-red-600 mb-4 text-lg">Pedidos retrasados</h4>
            {retrasosPedidos ? (
              <div className="flex flex-col gap-3 text-lg">
                {pedidosRetrasados.map((p, idx) => {
                  const hoy = new Date();
                  const fechaPedido = new Date(p.fecha);
                  hoy.setHours(0,0,0,0);
                  fechaPedido.setHours(0,0,0,0);
                  const diff = Math.abs(Math.round((hoy - fechaPedido) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={p.id || idx} className="text-gray-800 mb-2">
                      <span className="font-semibold text-red-700">{p.producto}</span> - Retrasado {diff} día{diff !== 1 ? 's' : ''}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-lg">
                <span className="font-medium text-black">No hay pedidos retrasados.</span>
              </div>
            )}
          </div>
          {/* Productos por vencer */}
          <div className="mb-8">
            <h4 className="font-semibold text-orange-600 mb-4 text-lg">Productos próximos a vencer</h4>
            {productosPorVencer.length === 0 ? (
              <div className="text-gray-500 text-lg">No hay productos próximos a vencer.</div>
            ) : (
              <ul className="space-y-3">
                {productosPorVencer.map((prod, idx) => (
                  <li key={prod.id || prod._id || idx} className="border-b pb-3 last:border-b-0 flex items-center gap-2">
                    <span className="font-semibold text-orange-700 text-lg">{prod.name || prod.nombre}</span>
                    {prod.expirationDate || prod.expiration_date ? (
                      <span className="ml-2 text-gray-600 text-base">Vence: {new Date(prod.expirationDate || prod.expiration_date).toLocaleDateString()}</span>
                    ) : null}
                    {prod.lote && <span className="ml-2 text-gray-500 text-base">Lote: {prod.lote}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CardAlertas;
