import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Package, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

// Datos de ejemplo para las gráficas
const salesByProduct = [
  { name: 'Laptop HP', sales: 45, color: '#3B82F6' },
  { name: 'Mouse Gamer', sales: 38, color: '#3B82F6' },
  { name: 'Teclado', sales: 32, color: '#3B82F6' },
  { name: 'Monitor', sales: 25, color: '#3B82F6' },
  { name: 'Audífonos', sales: 20, color: '#3B82F6' },
];

const monthlySales = [
  { month: 'Ene', sales: 45000 },
  { month: 'Feb', sales: 52000 },
  { month: 'Mar', sales: 48000 },
  { month: 'Abr', sales: 61000 },
  { month: 'May', sales: 55000 },
  { month: 'Jun', sales: 67000 },
  { month: 'Jul', sales: 73000 },
  { month: 'Ago', sales: 69000 },
];

// Componente Card personalizado
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Componente Badge personalizado
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Componente Alert personalizado
const Alert = ({ children, className = "" }) => (
  <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = "" }) => (
  <div className={`text-sm text-yellow-800 ${className}`}>
    {children}
  </div>
);

export function Dashboard() {
  const [userName] = useState('Juan Tendero');

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Tooltip personalizado para el gráfico de líneas
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-purple-600">
            Ventas: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">¡Hola, {userName}!</span>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Buscar
          </button>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard de Ventas</h1>
        <p className="text-gray-600">
          Bienvenido a la página principal de tu tienda digital. Aquí encontrarás un resumen de tus métricas clave.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventas del Día</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$452.000 COP</div>
            <p className="text-xs text-gray-600">15 ventas realizadas hoy</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Productos por Agotarse</CardTitle>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">8</div>
            <p className="text-xs text-gray-600">Requieren reposición pronto</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Últimos Pedidos</CardTitle>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">12</div>
            <p className="text-xs text-gray-600">Pedidos pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-500 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertDescription>
                Stock bajo: Laptop HP (5 unidades restantes)
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                Pedido #1234 requiere atención urgente
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                Revisión de inventario programada para mañana
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Sales by Product */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Ventas por Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByProduct} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    fontSize={10}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis fontSize={10} tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Producto más vendido:</span>
                <Badge variant="secondary">Laptop HP</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total vendidas:</span>
                <span className="text-sm font-medium text-green-600">160 unidades</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales Trend */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ventas Totales Mensuales
            </CardTitle>
            <p className="text-xs text-gray-600">Agosto 2025</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={10}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    fontSize={10}
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Este mes</p>
                <p className="font-medium text-purple-600">{formatCurrency(69000)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Promedio</p>
                <p className="font-medium text-gray-700">{formatCurrency(58750)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;