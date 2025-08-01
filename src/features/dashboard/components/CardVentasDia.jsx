import { DollarSignIcon } from "lucide-react";

const CardVentasDia = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
          <DollarSignIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Ventas del Día</h2>
      </div>
      <p className="text-3xl font-bold text-blue-600">$452.000 COP</p>
      <p className="text-sm text-gray-500">15 ventas realizadas hoy</p>
    </div>
  );
};

export default CardVentasDia;
