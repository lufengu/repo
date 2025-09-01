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
  const { productos, loading: loadingInventario, error: errorInventario, cargarProductos } = useProductos();
  const { loading: loadingVentas, error: errorVentas } = useProductosVentas();
  const [ventas, setVentas] = useState([]);
  const [sugerencias, setSugerencias] = useState({
    productosReforzar: [],
    diasPromocion: [],
    alertas: [],
    conteoAlertas: { total: 0, vencimiento: 0, riesgo_vencimiento: 0, baja_rotacion: 0 },
  });

  // Estado y paginación de alertas
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas' | 'vencimiento' | 'riesgo_vencimiento' | 'baja_rotacion'
  const [alertasPage, setAlertasPage] = useState(1);
  const alertasPerPage = 4;

  // ---------- Umbrales / Parámetros ----------
  const TH = {
    W: 30,                       // ventana de cálculo en días
    velocity_threshold: 0.5,     // unidades/día para baja velocidad
    overstock_dos_threshold: 45, // días de cobertura (DOS) considerados exceso
    no_movement_threshold: 7,    // días sin venta
    expiry_threshold: 30,        // días para "próximo a vencer"
    sellout_safety: 1.2,         // colchón para riesgo de vencimiento
    epsilon: 0.1,                // divide-by-zero guard
  };

  // --------- Helpers ---------
  const normalize = (s) => (s ? String(s).trim().toLowerCase() : '');
  const daysBetween = (d1, d2) => {
    const ms = (new Date(d2)).getTime() - (new Date(d1)).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  // Frases simples para motivos
  const formatDias = (d) => {
    if (d == null) return '';
    if (d < 0) return 'ya se venció';
    if (d === 0) return 'hoy';
    if (d === 1) return '1 día';
    if (d > 365) return 'muchos días';
    return `${d} días`;
  };

  const buildMotivo = ({
    expiry,
    riskExpiry,
    lowRotation,
    days_to_expiry,
    days_without_sales,
    days_of_supply,
    TH
  }) => {
    const partes = [];
    if (expiry) {
      partes.push(days_to_expiry < 0 ? 'El producto ya se venció' : `Se vence pronto (en ${formatDias(days_to_expiry)})`);
    } else if (riskExpiry) {
      partes.push('Puede vencerse antes de venderse');
    }
    if (lowRotation) {
      if (days_without_sales >= TH.no_movement_threshold) {
        partes.push(`No se vende hace ${formatDias(days_without_sales)}`);
      } else if (days_of_supply >= TH.overstock_dos_threshold) {
        partes.push('Hay mucho stock para lo que se vende');
      } else {
        partes.push('Se vende muy poco');
      }
    }
    return partes.slice(0, 2).join(' • ');
  };

  useEffect(() => {
    // cargar ventas (definida aquí para poder invocarla desde el doble click)
    const fetchVentas = async () => {
      try {
        const data = await salesAPI.get('/sales/list');
        setVentas(Array.isArray(data?.data) ? data.data : []);
      } catch {
        setVentas([]);
      }
    };
    fetchVentas();
  }, []);

  // Exponer función de recarga para doble click
  const reloadData = async () => {
    try {
      if (typeof cargarProductos === 'function') await cargarProductos();
    } catch (e) {
      console.error('Error recargando productos:', e);
    }
    try {
      const data = await salesAPI.get('/sales/list');
      setVentas(Array.isArray(data?.data) ? data.data : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const now = new Date();
    const startWindow = new Date(now);
    startWindow.setDate(now.getDate() - TH.W);

    // ---------- Ventas por producto (últimos W días) ----------
    // key -> { units30d, lastSaleDate }
    const salesByProduct = new Map();

    const addSale = (nombreProd, qty, fechaVenta) => {
      const key = normalize(nombreProd);
      if (!key) return;
      const ref = salesByProduct.get(key) || { units30d: 0, lastSaleDate: null };
      const fecha = new Date(fechaVenta || now);

      if (fecha >= startWindow) ref.units30d += Number(qty) || 0;
      if (!ref.lastSaleDate || fecha > ref.lastSaleDate) ref.lastSaleDate = fecha;

      salesByProduct.set(key, ref);
    };

    for (const v of ventas || []) {
      const f = new Date(v?.createdAt || v?.date || v?.fecha || now);
      if (Array.isArray(v?.items)) {
        for (const item of v.items) {
          const qty = item?.quantity ?? item?.qty ?? item?.cantidad ?? 0;
          addSale(item?.name || item?.producto || item?.product, qty, f);
        }
      } else {
        const qty = v?.quantity ?? v?.qty ?? v?.cantidad ?? 0;
        addSale(v?.product || v?.producto || v?.nombre, qty, f);
      }
    }

    // ---------- Productos a reforzar (stock bajo) ----------
    const productosReforzar = (productos || [])
      .filter(p => {
        const umbral = typeof p?.stockMinimo === 'number' ? p.stockMinimo : 5;
        return (Number(p?.stock) || 0) < umbral;
      })
      .map(p => {
        return {
          nombre: p?.nombre || p?.product || 'Producto',
          motivo: `Stock bajo: ${p?.stock ?? 0} unidades`
        };
      });

    // ---------- Alertas (con categorías) ----------
    const alertas = [];
    let cntVenc = 0, cntRiesgo = 0, cntBaja = 0;

    for (const p of (productos || [])) {
      const key = normalize(p?.nombre || p?.product);
      const stock = Number(p?.stock) || 0;

      const sales = salesByProduct.get(key) || { units30d: 0, lastSaleDate: null };
      const avg_daily_units = sales.units30d / Math.max(TH.W, 1);
      const days_of_supply = stock / Math.max(avg_daily_units, TH.epsilon);
      const days_without_sales = sales.lastSaleDate ? daysBetween(sales.lastSaleDate, now) : 999;

      // fecha de vencimiento (si aplica)
      let days_to_expiry = null;
      if (p?.fechaVencimiento) {
        const exp = new Date(p.fechaVencimiento);
        days_to_expiry = daysBetween(now, exp);
      }

      const lowRotation =
        (avg_daily_units <= TH.velocity_threshold && stock > 0) ||
        (days_of_supply >= TH.overstock_dos_threshold) ||
        (days_without_sales >= TH.no_movement_threshold);

      const expiry = (days_to_expiry !== null && stock > 0 && days_to_expiry <= TH.expiry_threshold);
      const riskExpiry = (days_to_expiry !== null && stock > 0 && (days_of_supply > (days_to_expiry * TH.sellout_safety)));

      if (lowRotation || expiry || riskExpiry) {
        // Clasificación principal (prioridad: vencimiento > riesgo > baja)
        let categoria = 'baja_rotacion';
        let subtipo = null;

        if (expiry) {
          categoria = 'vencimiento';
        } else if (riskExpiry) {
          categoria = 'riesgo_vencimiento';
        } else if (lowRotation) {
          if (days_without_sales >= TH.no_movement_threshold) subtipo = 'sin_ventas';
          else if (days_of_supply >= TH.overstock_dos_threshold) subtipo = 'cobertura_alta';
          else subtipo = 'velocidad_baja';
        }

        if (categoria === 'vencimiento') cntVenc++;
        else if (categoria === 'riesgo_vencimiento') cntRiesgo++;
        else cntBaja++;

        const motivo = buildMotivo({
          expiry,
          riskExpiry,
          lowRotation,
          days_to_expiry,
          days_without_sales,
          days_of_supply,
          TH
        });

        alertas.push({
          producto: p?.nombre || p?.product || 'Producto',
          motivo,
          categoria,
          subtipo,
        });
      }
    }

    // ---------- Días y horarios óptimos para promociones ----------
    const ventasPorDia = {};
    for (const v of (ventas || [])) {
      const fecha = new Date(v?.createdAt || v?.date || v?.fecha || now);
      const dia = fecha.toLocaleDateString('es-CO', { weekday: 'long' });
      ventasPorDia[dia] = (ventasPorDia[dia] || 0) + 1;
    }

    const topDias = Object.entries(ventasPorDia)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dia, cantidad]) => ({ dia, motivo: `Frecuencia de compra: ${cantidad}` }));

    setSugerencias({
      productosReforzar,
      diasPromocion: topDias,
      alertas,
      conteoAlertas: {
        total: alertas.length,
        vencimiento: cntVenc,
        riesgo_vencimiento: cntRiesgo,
        baja_rotacion: cntBaja,
      }
    });

    setAlertasPage(1); // Reiniciar página cada vez que cambian las alertas
  }, [productos, ventas]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Floating / draggable behavior ----------
  const savedPos = (() => {
    try { return JSON.parse(localStorage.getItem('recFloatingPos')) || null; } catch { return null; }
  })();
  const [pos, setPos] = useState(() => savedPos || { right: 24, bottom: 24 });
  const draggingRef = React.useRef(false);
  const startRef = React.useRef({ x: 0, y: 0, origX: 0, origY: 0 });
  const lastTapRef = React.useRef(0);

  const onPointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { x: clientX, y: clientY, origX: pos.left ?? window.innerWidth - (pos.right || 24), origY: pos.top ?? window.innerHeight - (pos.bottom || 24) };
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startRef.current.x;
    const dy = clientY - startRef.current.y;
    const newLeft = Math.max(8, Math.min(window.innerWidth - 48, startRef.current.origX + dx));
    const newTop = Math.max(8, Math.min(window.innerHeight - 48, startRef.current.origY + dy));
    setPos({ left: newLeft, top: newTop });
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
    // persist position
  try { localStorage.setItem('recFloatingPos', JSON.stringify(pos)); } catch (err) { console.error(err); }
  };

  const handleDoubleClick = async (e) => {
    e.stopPropagation();
    // abrir y recargar datos
    setOpen(true);
    await reloadData();
  };

  // --------- Filtrado + Paginación de alertas ---------
  const alertasFiltradas = sugerencias.alertas.filter(a =>
    filtroTipo === 'todas' ? true : a.categoria === filtroTipo
  );

  const totalAlertas = alertasFiltradas.length;
  const totalPages = Math.ceil(totalAlertas / alertasPerPage) || 1;
  const alertasToShow = alertasFiltradas.slice(
    (alertasPage - 1) * alertasPerPage,
    alertasPage * alertasPerPage
  );

  // Reiniciar a página 1 cuando cambia el filtro
  useEffect(() => { setAlertasPage(1); }, [filtroTipo]);

  // Styles simples para los filtros
  const chip = (active) => ({
    padding: '6px 10px',
    borderRadius: '999px',
    border: '1px solid #1976d2',
    background: active ? '#1976d2' : 'transparent',
    color: active ? '#fff' : '#1976d2',
    fontSize: '12px',
    cursor: 'pointer'
  });

  return (
    <>
      <button
        className="recomendaciones-floating-btn"
        onDoubleClick={handleDoubleClick}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onTouchEnd={(e) => {
          // Detect double-tap for touch devices
          if (draggingRef.current) return;
          const now = Date.now();
          const TIME = 300; // ms
          if (now - lastTapRef.current <= TIME) {
            handleDoubleClick(e);
            lastTapRef.current = 0;
          } else {
            lastTapRef.current = now;
          }
        }}
        title="Ver recomendaciones (doble clic)"
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          right: undefined,
          bottom: undefined,
          zIndex: 1000,
          cursor: 'grab'
        }}
      >
        <img src={portadaImg} alt="Ver recomendaciones" style={{ width: 70, height: 75, pointerEvents: 'none' }} />
      </button>

      {open && (
        <div className="recomendaciones-modal-overlay" onClick={() => setOpen(false)}>
          <div className="recomendaciones-modal" onClick={e => e.stopPropagation()} style={{ color: '#000', width: '50%', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            {/* Header fijo */}
            <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, padding: '24px 0 8px 0', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px' }}>
                RECOMENDACIONES
              </h2>
            </div>

            {/* Contenido scrollable */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-between', overflowY: 'auto', flex: 1, padding: '24px 0' }}>
              {/* Columna izquierda */}
              <div className="recomendaciones-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <MetricCard title="Historial de ventas" icon={<FaLightbulb />}>
                  <div>{ventas.length} registros</div>
                </MetricCard>
                <MetricCard title="Datos de inventario" icon={<FaLightbulb />}>
                  <div>{productos.length} productos</div>
                </MetricCard>
                <MetricCard title="Registro de pedidos y frecuencia de compra" icon={<FaLightbulb />}>
                  <ul>
                    {sugerencias.diasPromocion.length === 0 && <li>No hay datos suficientes.</li>}
                    {sugerencias.diasPromocion.map((d, i) => (
                      <li key={i}>{d.dia} <span className="motivo">({d.motivo})</span></li>
                    ))}
                  </ul>
                </MetricCard>
                {(loadingInventario || loadingVentas) && <MetricCard title="Cargando datos..." />}
                {(errorInventario || errorVentas) && <MetricCard title="Error al cargar datos" />}
              </div>

              {/* Columna derecha */}
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
                  <div>Analiza los días con mayor frecuencia de compra en el card de pedidos.</div>
                </MetricCard>

                <MetricCard title="Alertas de productos de baja rotación o vencimiento" icon={<FaLightbulb />}>
                  {/* Filtros */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <button style={chip(filtroTipo === 'todas')} onClick={() => setFiltroTipo('todas')}>
                      Todas ({sugerencias.conteoAlertas.total})
                    </button>
                    <button style={chip(filtroTipo === 'vencimiento')} onClick={() => setFiltroTipo('vencimiento')}>
                      Vencimiento ({sugerencias.conteoAlertas.vencimiento})
                    </button>
                    <button style={chip(filtroTipo === 'riesgo_vencimiento')} onClick={() => setFiltroTipo('riesgo_vencimiento')}>
                      Riesgo ({sugerencias.conteoAlertas.riesgo_vencimiento})
                    </button>
                    <button style={chip(filtroTipo === 'baja_rotacion')} onClick={() => setFiltroTipo('baja_rotacion')}>
                      Baja rotación ({sugerencias.conteoAlertas.baja_rotacion})
                    </button>
                  </div>

                  {/* Lista */}
                  <ul>
                    {totalAlertas === 0 && <li>No hay alertas.</li>}
                    {alertasToShow.map((a, i) => (
                      <li key={i}>
                        {a.producto} <span className="motivo">({a.motivo})</span>
                      </li>
                    ))}
                  </ul>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="alertas-paginacion">
                      <button
                        className="paginacion-btn paginacion-btn-azul"
                        style={{ fontSize: '0.77em', padding: '0.25em 0.6em' }}
                        onClick={() => setAlertasPage(p => Math.max(1, p - 1))}
                        disabled={alertasPage === 1}
                      >Anterior</button>
                      <span className="paginacion-info-azul">{alertasPage}/{totalPages}</span>
                      <button
                        className="paginacion-btn paginacion-btn-azul"
                        style={{ fontSize: '0.77em', padding: '0.25em 0.6em' }}
                        onClick={() => setAlertasPage(p => Math.min(totalPages, p + 1))}
                        disabled={alertasPage === totalPages}
                      >Siguiente</button>
                    </div>
                  )}
                </MetricCard>
              </div>
            </div>
            {/* Botón cerrar fijo abajo a la izquierda */}
            <button className="cerrar-modal-btn cerrar-btn-naranja" style={{ position: 'sticky', left: 0, bottom: 0, margin: '24px 0 0 24px', alignSelf: 'flex-start', zIndex: 20 }} onClick={() => setOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecomendacionesFloatingButton;
