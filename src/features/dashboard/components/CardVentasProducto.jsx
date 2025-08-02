import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from "lucide-react";

const CardVentasProducto = () => {
  // Datos de ejemplo (reemplazar con datos reales de ventas)
  const data = [
    { producto: 'Laptop HP', ventas: 45, color: '#3B82F6' },
    { producto: 'Mouse Logitech', ventas: 32, color: '#10B981' },
    { producto: 'Teclado Gaming', ventas: 28, color: '#F59E0B' },
    { producto: 'Monitor 24"', ventas: 15, color: '#EF4444' },
    { producto: 'Webcam HD', ventas: 12, color: '#8B5CF6' }
  ];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Ventas: <span className="font-semibold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Ventas por Producto</h2>
      </div>
      
      {/* Gráfica de barras */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="producto" 
              fontSize={10} 
              tick={{ fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              fontSize={10} 
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="ventas" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              name="Ventas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Información adicional */}
      <div className="mt-3 flex justify-between items-center">
        <div className="text-left">
          <p className="text-xs text-gray-500">Producto más vendido:</p>
          <p className="text-sm font-medium text-gray-700">
            {data.length > 0 ? data[0].producto : 'N/A'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total vendido:</p>
          <p className="text-sm font-medium text-green-600">
            {data.reduce((sum, item) => sum + item.ventas, 0)} unidades
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardVentasProducto;
