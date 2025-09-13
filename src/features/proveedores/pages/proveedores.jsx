import React, { useState, useEffect } from "react";
import { getProviders, createProvider, deleteProvider, updateProvider } from '../services/providerService';
import { uploadObject, getObjectBlobUrl } from '../services/objectService';
import { useAuth } from "../../auth/context/AuthContext";
import { FaWhatsapp, FaRegBuilding, FaSearch, FaTrashAlt, FaEdit } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";
import { useProductos } from '../../../hooks/useProductos';

export default function ProveedoresPage() {
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.name || user.nombre || user.firstName || user.username || 'Usuario';
        setUserName(name);
      } catch (error) {
        setUserName('Usuario');
      }
    }
  }, []);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  // Placeholder para cuando no haya imagen o falle la carga
  const PLACEHOLDER_IMG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='320'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='48' fill='%239ca3af'>Sin imagen</text></svg>";

  const { productos, cargarProductos } = useProductos();


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("proveedores");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombreProveedor: "",
    nombreEncargado: "",
    whatsapp: "",
    correo: "",
    direccion: "",
    deliveryDay: "", 
    imagen: null,
    imagenFile: null, 
  });
  const [cards, setCards] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  // Cargar proveedores reales del backend
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const data = await getProviders();
        console.log('Providers list:', data);
        const base = data.map((prov) => {
          const oid = prov.objectId ?? prov.object_id ?? null;
          const delivery = (prov.deliveryDay ?? prov.delivery_day ?? prov.delivery) || "";
          return {
            id: prov.id,
            objectId: oid ? String(oid) : null,
            img: null,
            title: prov.title,
            ownerName: prov.ownerName,
            whatsappNumber: prov.whatsappNumber,
            email: prov.email,
            address: prov.address,
            deliveryDay: delivery,
            desc: `Encargado: ${prov.ownerName}\nWhatsApp: ${prov.whatsappNumber}\nCorreo: ${prov.email}\nDirección: ${prov.address}${delivery ? "\nDescripción: " + delivery : ""}`,
          };
        });
        setCards(base);

        base.forEach(async (_c, idx) => {
          const oid = base[idx].objectId;
          if (!oid) return;
          try {
            const blobUrl = await getObjectBlobUrl(oid);
            setCards((prev) => {
              const copy = [...prev];
              if (copy[idx]) copy[idx] = { ...copy[idx], img: blobUrl };
              return copy;
            });
          } catch (e) {
            console.warn('Error cargando imagen', oid, e);
          }
        });

        setError(null);
      } catch (e) {
        console.error('getProviders error:', e);
        setError('Error al cargar proveedores');
      } finally {
        setLoading(false);
      }
    };
  fetchProviders();
  }, []);
  const [showOrdenar, setShowOrdenar] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [unidad, setUnidad] = useState("unidades");
  const { user } = useAuth();
    useEffect(() => {
      console.log('user en ProveedoresPage:', user);
    }, [user]);
  // Función para obtener el nombre del usuario dinámicamente
  const getUserName = () =>
    user && (user.name || user.nombre || user.firstName || user.username)
      ? (user.name || user.nombre || user.firstName || user.username)
      : "Usuario";
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Util: convertir archivo a Base64 (Data URL)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // "data:<mime>;base64,...."
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files && files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("El archivo debe ser una imagen.");
        return;
      }
      const maxSize = 2 * 1024 * 1024; 
      if (file.size > maxSize) {
        alert("La imagen supera los 2MB permitidos.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setForm({ ...form, imagen: base64, imagenFile: file }); // Base64 para previsualizar y File para subir
      } catch {
        alert("No se pudo leer la imagen.");
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Crear proveedor usando la API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let objectId = null;
      if (form.imagenFile) {
        const up = await uploadObject(form.imagenFile);
        console.log('uploadObject ->', up);
        objectId = up?.id ?? null; 
      }

      const payload = {
        title: form.nombreProveedor,
        ownerName: form.nombreEncargado,
        whatsappNumber: (form.whatsapp || '').replace(/\D/g, ''),
        email: form.correo,
        address: form.direccion,
        deliveryDay: form.deliveryDay || "", 
        objectId: objectId ?? null, 
      };
      console.log('createProvider payload:', payload);

      const creado = await createProvider(payload);
      console.log('createProvider ->', creado);

      let imgSrc = null;
      if (objectId) {
        try {
          imgSrc = await getObjectBlobUrl(objectId);
        } catch (e) {
          console.warn('Error obteniendo blob recién creado', objectId, e);
        }
      }

      setCards((prev) => [
        {
          id: creado.id,
          objectId,
          img: imgSrc,
          title: creado.title,
          // Guardamos campos para edición futura
          ownerName: creado.ownerName,
          whatsappNumber: creado.whatsappNumber,
          email: creado.email,
          address: creado.address,
          deliveryDay: creado.deliveryDay ?? payload.deliveryDay ?? "",
          desc: `Encargado: ${creado.ownerName}\nWhatsApp: ${creado.whatsappNumber}\nCorreo: ${creado.email}\nDirección: ${creado.address}${(creado.deliveryDay ?? payload.deliveryDay) ? "\nDescripción: " + (creado.deliveryDay ?? payload.deliveryDay) : ""}`,
        },
        ...prev,
      ]);

      setForm({
        nombreProveedor: "",
        nombreEncargado: "",
        whatsapp: "",
        correo: "",
        direccion: "",
        deliveryDay: "",
        imagen: null,
        imagenFile: null,
      });
      handleCloseModal();
    } catch (error) {
      console.error('Error crear proveedor/objeto:', error?.response?.data || error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Error al crear proveedor';
      alert(`Error al crear proveedor: ${msg}`);
    }
  };

  // Abrir modal de ordenar
  const handleOpenOrdenar = (card) => {
    setProveedorSeleccionado(card);
    // Refrescar productos desde inventario antes de abrir el modal 
    cargarProductos().then((lista) => {
      const first = lista && lista.length > 0 ? lista[0] : null;
      const nombre = first?.nombre || first?.name || "";
      setProductoSeleccionado(nombre);
      setCantidad(1);
      setUnidad(first?.unidadMedida || "unidades");
      setMensaje(
        `Muy buenos días, soy ${getUserName()}. Necesito pedir 1 ${first?.unidadMedida || "unidades"} de ${nombre}. ¿Qué precio tendría ese pedido?`
      );
      setShowOrdenar(true);
    }).catch(() => {
      // En caso de error, abrir modal con valores por defecto vacíos
      setProductoSeleccionado("");
      setCantidad(1);
      setUnidad("unidades");
      setMensaje(`Muy buenos días, soy ${getUserName()}. Necesito pedir 1 unidades de . ¿Qué precio tendría ese pedido?`);
      setShowOrdenar(true);
    });
  };

  // Actualizar mensaje
  const handleProductoChange = (e) => {
    const prod = productos.find(p => p.nombre === e.target.value);
    setProductoSeleccionado(e.target.value);
    setUnidad(prod?.unidadMedida || "unidades");
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${cantidad} ${prod?.unidadMedida || "unidades"} de ${e.target.value}. ¿Qué precio tendría ese pedido?`
    );
  };
  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${e.target.value} ${unidad} de ${productoSeleccionado}. ¿Qué precio tendría ese pedido?`
    );
  };
  const handleUnidadChange = (e) => {
    setUnidad(e.target.value);
    setMensaje(
      `Muy buenos días, soy ${getUserName()}. Necesito pedir ${cantidad} ${e.target.value} de ${productoSeleccionado}. ¿Qué precio tendría ese pedido?`
    );
  };

  const handleCloseOrdenar = () => {
    setShowOrdenar(false);
    setProveedorSeleccionado(null);
  };

  const handleEnviarWhatsApp = () => {
    if (!proveedorSeleccionado) return;
    const match = proveedorSeleccionado.desc.match(/WhatsApp: ([^\n]+)/i);
    const numero = match ? match[1].replace(/\s+/g, "") : "";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // Eliminar proveedor usando la API
  const handleEliminarProveedor = async (idx) => {
    const proveedor = cards[idx];
    if (!proveedor.id) {
      setCards(cards.filter((_, i) => i !== idx));
      return;
    }
    if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
      try {
        await deleteProvider(proveedor.id);
        setCards(cards.filter((_, i) => i !== idx));
      } catch (error) {
        console.error('Error eliminar proveedor:', error);
        alert('Error al eliminar proveedor');
      }
    }
  };

  // --- ESTADO Y HANDLERS PARA EDITAR ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    id: null,
    nombreProveedor: "",
    nombreEncargado: "",
    whatsapp: "",
    correo: "",
    direccion: "",
    deliveryDay: "", // Nuevo campo para edición
    imagen: null,      // preview (dataURL o URL actual)
    imagenFile: null,  // File seleccionado
    objectId: null,
  });

  const openEditFromCard = (card, idx) => {
    setEditIndex(idx);
    setEditForm({
      id: card.id,
      nombreProveedor: card.title || "",
      nombreEncargado: card.ownerName || "",
      whatsapp: card.whatsappNumber || "",
      correo: card.email || "",
      direccion: card.address || "",
      deliveryDay: card.deliveryDay || "", 
      imagen: card.img || null,
      imagenFile: null,
      objectId: card.objectId || null,
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditIndex(null);
    setEditForm({
      id: null,
      nombreProveedor: "",
      nombreEncargado: "",
      whatsapp: "",
      correo: "",
      direccion: "",
      deliveryDay: "",
      imagen: null,
      imagenFile: null,
      objectId: null,
    });
  };

  const handleEditInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files && files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("El archivo debe ser una imagen.");
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert("La imagen supera los 2MB permitidos.");
        return;
      }
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setEditForm((prev) => ({ ...prev, imagen: reader.result, imagenFile: file }));
        };
        reader.onerror = () => alert("No se pudo leer la imagen.");
        reader.readAsDataURL(file);
      } catch {
        alert("No se pudo leer la imagen.");
      }
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (editIndex == null || !cards[editIndex]) return;
    try {
      let newObjectId = editForm.objectId;

      // Si se seleccionó nueva imagen, subirla y obtener nuevo id
      if (editForm.imagenFile) {
        const up = await uploadObject(editForm.imagenFile);
        newObjectId = up?.id ?? null;
      }

      const payload = {
        title: editForm.nombreProveedor,
        ownerName: editForm.nombreEncargado,
        whatsappNumber: (editForm.whatsapp || "").replace(/\D/g, ""),
        email: editForm.correo,
        address: editForm.direccion,
        deliveryDay: editForm.deliveryDay || "",
        objectId: newObjectId ?? null,
      };

      const actualizado = await updateProvider(editForm.id, payload);

      const next = {
        id: actualizado?.id ?? editForm.id,
        title: actualizado?.title ?? payload.title,
        ownerName: actualizado?.ownerName ?? payload.ownerName,
        whatsappNumber: actualizado?.whatsappNumber ?? payload.whatsappNumber,
        email: actualizado?.email ?? payload.email,
        address: actualizado?.address ?? payload.address,
        objectId: actualizado?.objectId ?? newObjectId ?? null,
        deliveryDay: actualizado?.deliveryDay ?? payload.deliveryDay ?? "",
      };

      // Determinar imagen a mostrar
      let imgSrc = cards[editIndex].img;
      if (next.objectId && next.objectId !== cards[editIndex].objectId) {
        try {
          imgSrc = await getObjectBlobUrl(next.objectId);
        } catch {
          imgSrc = editForm.imagen || imgSrc;
        }
      } else if (editForm.imagenFile) {
        imgSrc = editForm.imagen || imgSrc;
      }

    setCards((prev) => {
        const copy = [...prev];
        copy[editIndex] = {
          ...copy[editIndex],
          title: next.title,
          ownerName: next.ownerName,
          whatsappNumber: next.whatsappNumber,
          email: next.email,
          address: next.address,
          objectId: next.objectId,
      img: imgSrc,
      deliveryDay: next.deliveryDay,
      desc: `Encargado: ${next.ownerName}\nWhatsApp: ${next.whatsappNumber}\nCorreo: ${next.email}\nDirección: ${next.address}${next.deliveryDay ? "\nDescripción: " + next.deliveryDay : ""}`,
        };
        return copy;
      });

      handleCloseEdit();
    } catch (error) {
      console.error('Error actualizar proveedor:', error?.response?.data || error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Error al actualizar proveedor';
      alert(`Error al actualizar proveedor: ${msg}`);
    }
  };

  // Filtrar proveedores según búsqueda
  const cardsFiltradas = cards.filter(card =>
    card.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  const [userName, setUserName] = useState('Usuario');
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.name || user.nombre || user.firstName || user.username || 'Usuario';
        setUserName(name);
      } catch (error) {
        setUserName('Usuario');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Menú fijo en escritorio */}
  <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white no-shadow-menu">
        <Menu
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
      {/* Botón para abrir menú en móviles */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Drawer menú en móviles */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="relative w-64 bg-white shadow-xl h-full">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-50"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              ×
            </button>
            <Menu
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          {/* Fondo oscuro para cerrar el menú */}
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <div className="flex-1 px-2 py-4 sm:px-4 md:p-8 w-full">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
  <div className="flex items-center space-x-4">
    <div className="flex items-center space-x-4">
      <p className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>¡Hola, {userName}!</p>
  <span className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>Un buen proveedor, un negocio más sólido</span>
    </div>
  </div>
</header>
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1">
            <FaRegBuilding className="text-2xl sm:text-3xl text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Proveedores</h1>
          </div>
          <p className="text-gray-500 mb-2 sm:mb-4 text-sm sm:text-base">Administra la información de contacto y configuración de proveedores</p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar proveedor..."
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow w-full sm:w-auto"
              onClick={handleOpenModal}
            >
              + Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Modal para nuevo proveedor */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseModal}
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">Registrar nuevo proveedor</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre de la empresa o proveedor</label>
                  <input
                    type="text"
                    name="nombreProveedor"
                    value={form.nombreProveedor}
                    onChange={handleInputChange}
                    placeholder="Ej: Distribuidora Central S.A."
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre de la persona encargada</label>
                  <input
                    type="text"
                    name="nombreEncargado"
                    value={form.nombreEncargado}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Número de WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Ej: +34 600 123 456"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleInputChange}
                    placeholder="Ej: pedidos@proveedor.com"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle Principal 123, Ciudad"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descripción</label>
                  <input
                    type="text"
                    name="deliveryDay"
                    value={form.deliveryDay}
                    onChange={handleInputChange}
                    placeholder="Ej: lunes, martes, etc."
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Subir imagen (opcional)</label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  <span className="text-xs text-gray-400">Formatos: JPG, PNG, SVG. Máx 2MB.</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                  >
                    Guardar proveedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mt-8 sm:mt-16">
          {cardsFiltradas.map((card, idx) => (
            <div
              key={idx}
              className="relative flex flex-col w-full max-w-xl rounded-xl bg-gradient-to-br from-white to-gray-50 bg-clip-border text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-6 sm:mb-8 mx-auto"
            >
              <div className="relative mx-2 sm:mx-4 -mt-6 h-48 sm:h-56 overflow-hidden rounded-xl shadow-lg group">
                {card.img ? (
                  <img
                    src={card.img}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                  />
                ) : (
                  <img
                    src={PLACEHOLDER_IMG}
                    alt="Sin imagen"
                    className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                  />
                )}
              </div>
              <div className="p-4 sm:p-6">
                <h5 className="mb-2 text-xl sm:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                  {card.title}
                </h5>
                <p className="text-sm sm:text-base font-light text-gray-700 whitespace-pre-line break-words">
                  {card.desc}
                </p>
              </div>
              <div className="p-4 sm:p-6 pt-0 w-full">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className="flex items-center justify-center w-full h-11 md:h-12 font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    onClick={() => handleOpenOrdenar(card)}
                  >
                    <span className="flex items-center gap-2">
                      Ordenar
                      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-5 h-5">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                      </svg>
                    </span>
                  </button>
                  <button
                    className="flex items-center justify-center w-full h-11 md:h-12 font-bold text-white rounded-lg bg-orange-500 hover:bg-orange-600 shadow-lg transition-all duration-300 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                    onClick={() => openEditFromCard(card, idx)}
                  >
                    <FaEdit className="mr-2 text-base" />
                    Editar
                  </button>
                  <button
                    className="flex items-center justify-center w-full h-11 md:h-12 font-bold text-white rounded-lg bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 text-base focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                    onClick={() => handleEliminarProveedor(idx)}
                  >
                    <FaTrashAlt className="mr-2 text-base" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal global para ordenar productos */}
        {showOrdenar && proveedorSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseOrdenar}
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">Ordenar producto</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Escoge el producto</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={productoSeleccionado}
                  onChange={handleProductoChange}
                >
                  {productos.filter(p => p.stock > 0).map((prod, idx) => (
                    <option key={idx} value={prod.nombre}>{prod.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Unidad de medida</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={unidad}
                  onChange={handleUnidadChange}
                >
                  <option value="unidades">unidades</option>
                  <option value="cajas">cajas</option>
                  <option value="paquetes">paquetes</option>
                  <option value="litros">litros</option>
                  <option value="kilos">kilos</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={cantidad}
                  onChange={handleCantidadChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Mensaje</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                />
              </div>
              <div className="flex justify-center">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
                  onClick={handleEnviarWhatsApp}
                  type="button"
                >
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar proveedor */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-[92vw] max-w-md relative p-5 sm:p-6 max-h-[90vh] overflow-auto">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                onClick={handleCloseEdit}
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">Editar proveedor</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nombre de la empresa o proveedor</label>
                  <input
                    type="text"
                    name="nombreProveedor"
                    value={editForm.nombreProveedor}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nombre de la persona encargada</label>
                  <input
                    type="text"
                    name="nombreEncargado"
                    value={editForm.nombreEncargado}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Número de WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={editForm.whatsapp}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editForm.correo}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={editForm.direccion}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Descripción</label>
                  <input
                    type="text"
                    name="deliveryDay"
                    value={editForm.deliveryDay}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Cambiar imagen (opcional)</label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  {editForm.imagen && (
                    <div className="mt-2 w-full h-28 border rounded flex items-center justify-center bg-white overflow-hidden">
                      <img
                        src={editForm.imagen}
                        alt="Preview"
                        className="max-h-28 object-contain"
                      />
                    </div>
                  )}
                  <span className="text-[11px] text-gray-400">Formatos: JPG, PNG, SVG. Máx 2MB.</span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                    onClick={handleCloseEdit}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow text-sm"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}