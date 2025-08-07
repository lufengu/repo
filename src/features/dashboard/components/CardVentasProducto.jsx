import React from "react";
import { useTopProducts } from "../../../hooks/useTopProducts";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const CardVentasProducto = ({ refreshTrigger }) => {
  const { topProducts, loading } = useTopProducts(refreshTrigger);

  if (loading) return <div>Cargando gráfica...</div>;

  const data = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: "Cantidad vendida",
        data: topProducts.map((p) => p.count),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg">
      <h2 className="font-semibold text-gray-700 mb-2">
        Top 5 productos más vendidos
      </h2>
      <Bar data={data} />
    </div>
  );
};

export default CardVentasProducto;
