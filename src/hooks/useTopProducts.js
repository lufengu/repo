import { useState, useEffect } from "react";
import { salesAPI } from "../features/ventas/services/salesService";

export function useTopProducts(refreshTrigger) {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndProcess() {
      setLoading(true);
      try {
        const sales = await salesAPI.getSales();
        const productCount = {};

        sales.forEach((sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
            });
          } else if (sale.product) {
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
  }, [refreshTrigger]); // <-- ahora depende del trigger

  return { topProducts, loading };
}