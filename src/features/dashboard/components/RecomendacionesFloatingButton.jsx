
import React, { useState, useEffect } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import './RecomendacionesFloatingButton.css';
import MetricCard from './MetricCard';
import { useProductos } from '../../../hooks/useProductos';
import { useProductosVentas } from '../../ventas/hooks/useProductosVentas';
import salesAPI from '../../auth/services/api';
import portadaImg from '../../../assets/portada.png';
function RecomendacionesFloatingButton() {
  const [open, setOpen] = useState(false);
  const { productos, loading: loadingInventario, error: errorInventario } = useProductos();
  const { loading: loadingVentas, error: errorVentas } = useProductosVentas();
  const [ventas, setVentas] = useState([]);
  const [sugerencias, setSugerencias] = useState({
    productosReforzar: [],
    diasPromocion: [],
    alertas: [],
  });
  // Estado para paginación de alertas
  const [alertasPage, setAlertasPage] = useState(1);
  const alertasPerPage = 4;

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const data = await salesAPI.get('/sales/list');
        setVentas(data.data || []);
      } catch {
        setVentas([]);
      }
    };
    fetchVentas();
  }, []);

  useEffect(() => {
    // Sugerencias automáticas
    // Productos a reforzar: stock bajo (< 5)
    const productosReforzar = productos.filter(p => p.stock < 5).map(p => ({
      nombre: p.nombre,
      motivo: `Stock bajo (${p.stock} unidades)`
    }));

    // Alertas de baja rotación o vencimiento
    const alertas = productos.filter(p => {
      // Baja rotación: ventas < 2 en el mes
      const ventasProducto = ventas.filter(v => {
        if (v.items && Array.isArray(v.items)) {
          return v.items.some(item => item.name === p.nombre);
        } else {
          return v.product === p.nombre;
        }
      });
      const ventasMes = ventasProducto.filter(v => {
        const fecha = new Date(v.createdAt);
        const ahora = new Date();
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      });
      return ventasMes.length < 2 || (p.fechaVencimiento && new Date(p.fechaVencimiento) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    }).map(p => ({
      producto: p.nombre,
      motivo: p.fechaVencimiento && new Date(p.fechaVencimiento) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        ? 'Próximo a vencer'
        : 'Baja rotación'
    }));

    // Días y horarios óptimos para promociones: agrupar ventas por día/hora
    const ventasPorDiaHora = {};
    ventas.forEach(v => {
      const fecha = new Date(v.createdAt);
      const dia = fecha.toLocaleDateString('es-CO', { weekday: 'long' });
      const hora = fecha.getHours();
      const clave = `${dia} ${hora}:00`;
      ventasPorDiaHora[clave] = (ventasPorDiaHora[clave] || 0) + 1;
    });
    const topDias = Object.entries(ventasPorDiaHora)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([clave, cantidad]) => {
        const [dia, horario] = clave.split(' ');
        return { dia, horario, motivo: `Frecuencia de compra: ${cantidad}` };
      });

    setSugerencias({
      productosReforzar,
      diasPromocion: topDias,
      alertas,
    });
    setAlertasPage(1); // Reiniciar página al cambiar alertas
  }, [productos, ventas]);

  // Calcular paginación de alertas
  const totalAlertas = sugerencias.alertas.length;
  const totalPages = Math.ceil(totalAlertas / alertasPerPage);
  const alertasToShow = sugerencias.alertas.slice(
    (alertasPage - 1) * alertasPerPage,
    alertasPage * alertasPerPage
  );

  return (
    <>
      <button
        className="recomendaciones-floating-btn"
        onClick={() => setOpen(true)}
        title="Ver recomendaciones"
        >
          <img src={portadaImg} alt="Ver recomendaciones" style={{ width: 70, height: 75 }} />
      </button>
      {open && (
        <div className="recomendaciones-modal-overlay" onClick={() => setOpen(false)}>
          <div className="recomendaciones-modal" onClick={e => e.stopPropagation()} style={{ color: '#000', width: '50%' }}>
            <h2 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '2px' }}>
              RECOMENDACIONES
            </h2>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-between' }}>
              <div className="recomendaciones-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <MetricCard title="Historial de ventas" icon={<FaLightbulb />}>
                  <div>{ventas.length} registros</div>
                </MetricCard>
                <MetricCard title="Datos de inventario" icon={<FaLightbulb />}>
                  <div>{productos.length} productos</div>
                </MetricCard>
                <MetricCard title="Registro de pedidos y frecuencia de compra" icon={<FaLightbulb />}>
                  <div>Incluye frecuencia de compra por producto</div>
                </MetricCard>
                {(loadingInventario || loadingVentas) && <MetricCard title="Cargando datos..." />}
                {(errorInventario || errorVentas) && <MetricCard title="Error al cargar datos" />}
              </div>
              <div className="recomendaciones-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <MetricCard title="Productos a reforzar en inventario" icon={<FaLightbulb />}>
                  <ul>
                    {sugerencias.productosReforzar.length === 0 && <li>No hay productos con stock bajo.</li>}
                    {sugerencias.productosReforzar.map((p, i) => (
                      <li key={i}>{p.nombre} <span className="motivo">({p.motivo})</span></li>
                    ))}
                  </ul>
                </MetricCard>
                <MetricCard title="Días y horarios óptimos para promociones" icon={<FaLightbulb />}>
                  <ul>
                    {sugerencias.diasPromocion.length === 0 && <li>No hay datos suficientes.</li>}
                    {sugerencias.diasPromocion.map((d, i) => (
                      <li key={i}>{d.dia} {d.horario} <span className="motivo">({d.motivo})</span></li>
                    ))}
                  </ul>
                </MetricCard>
                <MetricCard title="Alertas de productos de baja rotación o vencimiento" icon={<FaLightbulb />}>
                  <ul>
                    {totalAlertas === 0 && <li>No hay alertas.</li>}
                    {alertasToShow.map((a, i) => (
                      <li key={i}>{a.producto} <span className="motivo">({a.motivo})</span></li>
                    ))}
                  </ul>
                  {totalPages > 1 && (
                    <div className="alertas-paginacion">
                      <button
                        className="paginacion-btn paginacion-btn-azul"
                        onClick={() => setAlertasPage(p => Math.max(1, p - 1))}
                        disabled={alertasPage === 1}
                      >Anterior</button>
                      <span className="paginacion-info-azul">Página {alertasPage} de {totalPages}</span>
                      <button
                        className="paginacion-btn paginacion-btn-azul"
                        onClick={() => setAlertasPage(p => Math.min(totalPages, p + 1))}
                        disabled={alertasPage === totalPages}
                      >Siguiente</button>
                    </div>
                  )}
                </MetricCard>
              </div>
            </div>
            <button className="cerrar-modal-btn cerrar-btn-naranja" onClick={() => setOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecomendacionesFloatingButton;
