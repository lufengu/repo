import React from 'react';
import { PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ProductosPorCategoria = ({ productos = [] }) => {
  // Agrupar productos por categoría
  const categorias = productos.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
    return acc;
  }, {});

  const totalProductos = productos.length;

  // Preparar datos para la gráfica
  const chartData = Object.entries(categorias).map(([categoria, cantidad]) => ({
    name: categoria,
    value: cantidad,
    porcentaje: totalProductos > 0 ? ((cantidad / totalProductos) * 100).toFixed(1) : 0
  }));

  // Colores para cada segmento del pastel
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700">{data.payload.name}</p>
          <p className="text-xs text-blue-600">
            {data.value} productos ({data.payload.porcentaje}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <PieChartIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Productos por Categoría</h2>
      </div>
      
      {totalProductos > 0 ? (
        <div className="relative">
          {/* Donut Chart con información central */}
          <div className="h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Información en el centro del donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-700">{totalProductos}</span>
              <span className="text-xs text-gray-500">productos</span>
              <span className="text-xs text-blue-600">{Object.keys(categorias).length} cat.</span>
            </div>
          </div>
          
          {/* Leyenda horizontal compacta */}
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs text-blue-600 font-medium">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-gray-700 text-sm font-medium">Sin productos disponibles</span>
        </div>
      )}
    </div>
  );
};

export default ProductosPorCategoria;