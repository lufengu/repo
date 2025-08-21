import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

// Recibe los datos reales por props
const CardVentasMensuales = ({ data }) => {

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label} 2025</p>
          <p className="text-sm text-gray-600">
            Ventas: <span className="font-semibold text-purple-600">
              ${payload[0].value?.toLocaleString('es-CO')} COP
            </span>
          </p>
          {payload[0].payload.ventasUnidades && (
            <p className="text-xs text-gray-500">
              {payload[0].payload.ventasUnidades} unidades vendidas
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Obtener el mes actual y las ventas
  const mesActual = data && data.length > 0 ? data[data.length - 1] : { mes: '', ventas: 0, ventasUnidades: 0 };
  const ventasMesActual = mesActual.ventas;
  const porcentajeCambio = data && data.length > 1
     ? ((ventasMesActual - data[data.length - 2].ventas) / data[data.length - 2].ventas) * 100
     : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Ventas Totales Mensuales</h2>
      </div>

      <p className="text-sm text-gray-500">{mesActual.mes} 2025</p>

      {/* Gráfico de líneas */}
      <div className="mt-4 h-40">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="mes" className="text-gray-500" />
            <YAxis
              className="text-gray-500"
              width={75}
              tickFormatter={value => value.toLocaleString('es-CO')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="ventas" stroke="#6b46c1" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CardVentasMensuales;
