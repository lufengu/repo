import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getInventory } from "../../../services/inventoryService";
import { salesAPI } from "../../ventas/services/salesService";

const CardAlertas = () => {
  const [showModal, setShowModal] = useState(false);
  const [productosPorVencer, setProductosPorVencer] = useState([]);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchAlertas();
  }, []);

  // Mensaje de retrasos de pedidos (placeholder)
  const retrasosPedidos = false; // Cambiar cuando se implemente pedidos

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
            {/* Retrasos de pedidos: mostrar alerta roja si hay retrasos, si no mostrar mensaje azul */}
            {retrasosPedidos ? (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-red-500"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium">Retrasos de pedidos:</span>
                <span className="text-gray-700">Queso Alpina lleva 3 días de retraso.</span>
              </div>
            ) : (
              <div className="bg-[#E6F0FF] border border-[#B3D6FF] rounded-lg p-3 flex items-center gap-2">
                <span className="text-[#007AFF]"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium text-black">No hay pedidos retrasados.</span>
              </div>
            )}
            {/* Productos por vencer */}
              {productosPorVencer.length > 0 && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-orange-200" title="Haz click para ver más detalles">
                  <span className="text-orange-500"><AlertCircleIcon className="w-4 h-4" /></span>
                  <span className="font-medium">Productos por vencer:</span>
                  <span className="text-gray-700">
                    <b>{productosPorVencer[0].name || productosPorVencer[0].nombre}</b>
                    {productosPorVencer.length > 1 && (
                      <span> + {productosPorVencer.length - 1}</span>
                    )} están próximos a vencer</span>
                </div>
              )}
            {/* Ventas de hoy */}
            {ventasHoy === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-red-500"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium">Hoy no se ha registrado ninguna venta.</span>
              </div>
            ) : (
              <div className="bg-[#E6F0FF] border border-[#B3D6FF] rounded-lg p-3 flex items-center gap-2">
                <span className="text-[#007AFF]"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium text-black">Hoy ya se registró ventas. ¡Buen trabajo!</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    {/* Modal de alertas */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg min-h-[350px] max-h-[500px] overflow-y-auto relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setShowModal(false)}>&times;</button>
          <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2"><AlertCircleIcon className="w-5 h-5 text-red-500" /> Alertas Importantes</h3>
          {/* Pedidos retrasados */}
          <div className="mb-4">
            <h4 className="font-semibold text-red-600 mb-2">Pedidos retrasados</h4>
            {retrasosPedidos ? (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-red-500"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium">Retrasos de pedidos:</span>
                <span className="text-gray-700">Queso Alpina lleva 3 días de retraso.</span>
              </div>
            ) : (
              <div className="bg-[#E6F0FF] border border-[#B3D6FF] rounded-lg p-3 flex items-center gap-2">
                <span className="text-[#007AFF]"><AlertCircleIcon className="w-4 h-4" /></span>
                <span className="font-medium text-black">No hay pedidos retrasados.</span>
              </div>
            )}
          </div>
          {/* Productos por vencer */}
          <div>
            <h4 className="font-semibold text-orange-600 mb-2">Productos próximos a vencer</h4>
            {productosPorVencer.length === 0 ? (
              <div className="text-gray-500">No hay productos próximos a vencer.</div>
            ) : (
              <ul className="space-y-2">
                {productosPorVencer.map((prod, idx) => (
                  <li key={prod.id || prod._id || idx} className="border-b pb-2 last:border-b-0">
                    <span className="font-semibold text-orange-700">{prod.name || prod.nombre}</span>
                    {prod.expirationDate || prod.expiration_date ? (
                      <span className="ml-2 text-gray-600 text-xs">Vence: {new Date(prod.expirationDate || prod.expiration_date).toLocaleDateString()}</span>
                    ) : null}
                    {prod.lote && <span className="ml-2 text-gray-500 text-xs">Lote: {prod.lote}</span>}
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
