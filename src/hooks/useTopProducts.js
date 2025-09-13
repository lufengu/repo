import { useState, useEffect } from "react";
import { salesAPI } from "../features/ventas/services/salesService";
import { getInventory } from "../services/inventoryService";

export function useTopProducts(refreshTrigger) {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndProcess() {
      setLoading(true);
      try {
        // Obtener ventas y productos de inventario
        const [sales, inventory] = await Promise.all([
          salesAPI.getSales(),
          getInventory()
        ]);
        // Crear set de nombres de productos existentes en inventario
        const inventoryNames = new Set(inventory.map(item => item.name));
        const productCount = {};

        sales.forEach((sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              // Solo contar si el producto existe en inventario
              if (inventoryNames.has(item.name)) {
                productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
              }
            });
          } else if (sale.product && inventoryNames.has(sale.product)) {
            productCount[sale.product] = (productCount[sale.product] || 0) + (sale.quantity || 1);
          }
        });

        const top = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        setTopProducts(top);
      } catch (error) {
        console.error('Error obteniendo ventas para topProducts:', error);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAndProcess();
  }, [refreshTrigger]);

  return { topProducts, loading };
}