import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";
import Ventas from '../../ventas/pages/Ventas';

const CardVentasMensuales = ({ monthlyData }) => {
  // Datos de ejemplo (reemplazar con datos reales de ventas mensuales)
  const data = [
    { mes: 'Ene', ventas: 125000, ventasUnidades: 145 },
    { mes: 'Feb', ventas: 118000, ventasUnidades: 132 },
    { mes: 'Mar', ventas: 132000, ventasUnidades: 158 },
    { mes: 'Abr', ventas: 141000, ventasUnidades: 167 },
    { mes: 'May', ventas: 138000, ventasUnidades: 161 },
    { mes: 'Jun', ventas: 152000, ventasUnidades: 178 },
    { mes: 'Jul', ventas: 149000, ventasUnidades: 172 },
    { mes: 'Ago', ventas: 154200, ventasUnidades: 182 }
  ];

  // TODO: Conectar con API de ventas mensuales
  // const { data: ventasMensualesData, loading, error } = useVentasMensuales();
  // 
  // const fetchVentasMensuales = async () => {
  //   try {
  //     const response = await fetch('/api/ventas/mensuales');
  //     const ventasReales = await response.json();
  //     // Transformar datos de la API al formato del gráfico
  //     const dataTransformada = ventasReales.map(item => ({
  //       mes: item.mes,
  //       ventas: item.total_ventas,
  //       ventasUnidades: item.total_unidades
  //     }));
  //     setData(dataTransformada);
  //   } catch (error) {
  //     console.error('Error al obtener ventas mensuales:', error);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchVentasMensuales();
  // }, []);

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

  // Si hay datos reales, úsalos
  const mesActual = monthlyData
    ? { mes: monthlyData.month, ventas: monthlyData.totalSales }
    : data[data.length - 1];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Ventas Totales Mensuales</h2>
      </div>

      <p className="text-sm text-gray-500">{mesActual.mes}</p>
      <p className="text-xl font-bold text-purple-700">
        ${mesActual.ventas?.toLocaleString('es-CO')} COP
      </p>

      {/* Gráfico de líneas */}
      <div className="mt-4 h-40">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="mes" className="text-gray-500" />
            <YAxis className="text-gray-500" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="ventas" stroke="#6b46c1" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CardVentasMensuales;
