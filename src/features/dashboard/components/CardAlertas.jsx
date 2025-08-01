import { AlertCircleIcon } from "lucide-react";

const CardAlertas = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
          <AlertCircleIcon className="w-4 h-4 text-red-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Alertas Importantes</h2>
      </div>
      {/**  agregar la lógica para mostrar alertas específicas */}
    </div>
  );
};

export default CardAlertas;
