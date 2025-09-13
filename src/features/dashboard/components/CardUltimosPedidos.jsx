
import { Clock4 } from "lucide-react";
import { useEffect, useState } from "react";
import pedidosApi from "../../pedidos/services/pedidosApi";

const CardUltimosPedidos = () => {
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      try {
        const pedidos = await pedidosApi.getPedidos();
        // Filtrar solo los que no están retrasados
        const proximos = pedidos.filter(p => p.estado !== 'Retrasado')
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setUltimosPedidos(proximos);
      } catch {
        setUltimosPedidos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
          <Clock4 className="w-4 h-4" style={{ color: '#FF6600' }} />
        </div>
        <h2 className="font-semibold text-gray-700">Últimos Pedidos</h2>
      </div>
      <div className="mt-2">
        {loading ? (
          <div className="text-gray-400">Cargando pedidos...</div>
        ) : ultimosPedidos.length === 0 ? (
          <div className="text-gray-400">No hay pedidos próximos a entregar.</div>
        ) : (
          <>
            {ultimosPedidos.slice(0, 3).map((p, idx) => {
              // Formato fecha relativa
              const hoy = new Date();
              const fechaPedido = new Date(p.fecha);
              hoy.setHours(0,0,0,0);
              fechaPedido.setHours(0,0,0,0);
              const diff = (fechaPedido - hoy) / (1000 * 60 * 60 * 24);
              let fechaRel = '';
              if (diff === 0) fechaRel = 'hoy';
              else if (diff === 1) fechaRel = 'mañana';
              else if (diff < 0) fechaRel = <span className="text-red-500">retrasado</span>;
              else fechaRel = fechaPedido.toLocaleDateString();
              // Formato cantidad y unidad
              let cantidadStr = `${p.cantidad}`;
              if (p.producto && p.producto.toLowerCase().includes('botella')) cantidadStr += ' botellas';
              else if (p.producto && p.producto.toLowerCase().includes('paquete')) cantidadStr += ' paquetes';
              else if (p.producto && p.producto.toLowerCase().includes('pieza')) cantidadStr += ' piezas';
              // Truncar nombre si es largo
              let nombreProd = p.producto.length > 18 ? p.producto.slice(0, 18) + '...' : p.producto;
              return (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{nombreProd}</span>
                    <span className="text-xs text-gray-500">{fechaRel}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">{cantidadStr}</span>
                </div>
              );
            })}
            {ultimosPedidos.length > 3 && (
              <div className="text-gray-500 text-sm">y {ultimosPedidos.length - 3} más...</div>
            )}
            <div className="mt-2 text-right">
              <a href="/pedidos" className="text-blue-600 text-sm font-semibold hover:underline">Ver más</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CardUltimosPedidos;
