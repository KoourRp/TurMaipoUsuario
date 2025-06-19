import React from 'react';

interface BusPopupInfoProps {
  distance: number | null;
  eta: number | null;
  loading: boolean;
}

const BusPopupInfo = ({ distance, eta, loading }: BusPopupInfoProps) => {
  if (loading) return <p>⏳ Cargando datos del bus...</p>;

  return (
    <>
      <p>📍 Distancia (aprox.): {distance} m</p>
      <p>⏱️ ETA (aprox.): {eta} min</p>
    </>
  );
};

export default BusPopupInfo;
