import { Clock4 } from "lucide-react";

const CardUltimosPedidos = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
          <Clock4 className="w-4 h-4" style={{ color: '#FF6600' }} />
        </div>
        <h2 className="font-semibold text-gray-700">Últimos Pedidos</h2>
      </div>
      {/* Lista de pedidos recientes */}
    </div>
  );
};

export default CardUltimosPedidos;
