import { useState, useEffect } from 'react';

const paymentMethods = [
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'bancolombia', label: 'Bancolombia' },
];

const QrPaymentForm = ({ userName, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].value);
  const [qrImage, setQrImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (qrImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(qrImage);
    } else {
      setPreview(null);
    }
  }, [qrImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setQrImage(file);
    setSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!qrImage) return;
    setLoading(true);
    // Simular almacenamiento en localStorage por usuario y método
    const userKey = `qrPayments_${userName}`;
    const stored = JSON.parse(localStorage.getItem(userKey) || '{}');
    stored[selectedMethod] = preview;
    localStorage.setItem(userKey, JSON.stringify(stored));
    setLoading(false);
    setSuccess(true);
    setQrImage(null);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="absolute top-16 right-6 z-50 w-[370px] max-w-[95vw] rounded-lg shadow-lg border border-gray-200 animate-fade-in"
      style={{background: 'linear-gradient(135deg, #eaf3fb 0%, #fafdff 100%)', backdropFilter: 'blur(10px)'}}>
      <div className="relative p-6 pb-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-normal transition-colors"
          aria-label="Cerrar"
        >×</button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Cargar QR de Pago</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
            >
              {paymentMethods.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen QR</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
            />
          </div>
          {preview && (
            <div className="flex flex-col items-center gap-1 mt-2 animate-fade-in">
              <span className="text-xs text-gray-500 mb-1">Vista previa QR</span>
              <img src={preview} alt="QR Preview" className="w-48 h-48 object-contain border border-gray-300 rounded-md shadow" style={{maxWidth:'100%'}} />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !qrImage}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md mt-2 shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar QR'}
          </button>
          {success && <span className="text-green-600 text-sm font-medium text-center">¡QR guardado!</span>}
        </form>
      </div>
    </div>
  );
};

export default QrPaymentForm;
