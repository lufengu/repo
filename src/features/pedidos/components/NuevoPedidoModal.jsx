import React, { useState } from 'react';

function NuevoPedidoModal({ open, onClose, onCreate, pedido }) {
  const [producto, setProducto] = useState(pedido?.producto || '');
  const [proveedor, setProveedor] = useState(pedido?.proveedor || '');
  const [cantidad, setCantidad] = useState(pedido?.cantidad ? String(pedido.cantidad) : '');
  const [fecha, setFecha] = useState(pedido?.fecha ? pedido.fecha.slice(0,10) : '');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setProducto(pedido?.producto || '');
    setProveedor(pedido?.proveedor || '');
    setCantidad(pedido?.cantidad ? String(pedido.cantidad) : '');
    setFecha(pedido?.fecha ? pedido.fecha.slice(0,10) : '');
  }, [pedido, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!producto || !proveedor || !cantidad || !fecha) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(Number(cantidad)) || Number(cantidad) < 1) {
      setError('La cantidad debe ser un número mayor a 0.');
      return;
    }
    setError('');
    onCreate({ producto, proveedor, cantidad, fecha, estado: pedido?.estado || 'Pendiente' });
    setProducto('');
    setProveedor('');
    setCantidad('');
    setFecha('');
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', minWidth: '350px', maxWidth: '400px', width: '100%', minHeight: '350px', boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1.2rem', textAlign: 'center' }}>{pedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: '#e74c3c', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>{error}</div>
          )}
          <div style={{ marginBottom: '1.2rem' }}>
            <input type="text" placeholder="Producto" value={producto} onChange={e => setProducto(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem' }} />
            <input type="text" placeholder="Proveedor" value={proveedor} onChange={e => setProveedor(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem' }} />
            <input type="number" min="1" step="1" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem' }} />
            <input type="date" placeholder="Fecha" value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
            <button type="button" onClick={onClose} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: '1rem' }}>Cancelar</button>
            <button type="submit" style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: '1rem' }}>{pedido ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoPedidoModal;
