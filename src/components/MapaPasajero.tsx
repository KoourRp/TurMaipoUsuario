import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { getDistance } from 'geolib';

const MapaPasajero = () => {
  const [busStops, setBusStops] = useState<any[]>([]);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [busLocation, setBusLocation] = useState<any | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('bus_stops').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase conectado. Primer ID:', data?.[0]?.id);
      } catch (err) {
        console.error('❌ Error al conectar con Supabase:', err);
        setErrorMsg('No se pudo conectar a Supabase.');
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const fetchBusStops = async () => {
      const { data } = await supabase.from('bus_stops').select('*');
      console.log('📍 Paraderos cargados:', data);
      if (data) setBusStops(data);
    };
    fetchBusStops();
  }, []);

  useEffect(() => {
    if (!selectedStop) return;

    const fetchBusData = async () => {
      setLoading(true);
      setErrorMsg(null);
      console.log('🟡 Paradero seleccionado: 🟡', selectedStop);

      try {
        const { data: ra, error: errorRa } = await supabase
          .from('route_assignment')
          .select('bus_id')
          .eq('route_id', selectedStop.route_id)
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('📘 Resultado route_assignment:', ra);

        if (!ra || ra.length === 0 || errorRa) {
          setErrorMsg('No hay micro asignada a esta ruta.');
          setLoading(false);
          return;
        }

        const busId = ra[0].bus_id;

        const { data: busData, error: errorBus } = await supabase
          .from('bus_location')
          .select('*')
          .eq('bus_id', busId)
          .order('id', { ascending: false })
          .limit(1)
          .single();

        console.log('🚌 Última ubicación encontrada:', busData);

        if (!busData || errorBus) {
          setErrorMsg('No hay ubicación registrada para esta micro.');
          setLoading(false);
          return;
        }

        setBusLocation(busData);
        const dist = getDistance(
          { latitude: selectedStop.lat, longitude: selectedStop.lng },
          { latitude: busData.lat, longitude: busData.lng }
        );
        setDistance(dist);
        setEta(Math.round(dist / 82));
      } catch (err) {
        setErrorMsg('Error al obtener datos del bus.');
        console.error('❌ Error general al buscar micro:', err);
      }

      setLoading(false);
    };

    const interval = setInterval(fetchBusData, 10000);
    fetchBusData();

    return () => clearInterval(interval);
  }, [selectedStop]);

  return (
    <div className="w-full h-screen bg-[#181818] text-[#ebdbb2] relative">
      {errorMsg && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded shadow-md z-[1000]">
          ⚠️ {errorMsg}
        </div>
      )}
      {loading && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-md z-[1000]">
          🔄 Buscando ubicación del bus...
        </div>
      )}
      <MapContainer
        center={[-33.590175, -70.567891]}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />

        {busStops.map((stop) => {
          const features = stop.stops_json?.features || [];

          return features.map((feature: any, index: number) => {
            const [lng, lat] = feature.geometry.coordinates;
            return (
              <Marker
                key={`${stop.id}-${index}`}
                position={[lat, lng]}
                eventHandlers={{
                  click: () =>
                    setSelectedStop({
                      lat,
                      lng,
                      route_id: stop.route_id
                    }),
                }}
              >
                <Popup>
                  <strong>Paradero #{index + 1}</strong>
                  {selectedStop?.lat === lat && (
                    <div className="mt-2">
                      {busLocation ? (
                        <>
                          <p>📍 Distancia: {distance} m</p>
                          <p>⏱️ ETA: {eta} min</p>
                        </>
                      ) : (
                        <p>⏳ Cargando datos del bus...</p>
                      )}
                    </div>
                  )}
                </Popup>
              </Marker>
            );
          });
        })}

        {busLocation && (
          <Marker position={[busLocation.lat, busLocation.lng]}>
            <Popup>🚌 Micro actual</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapaPasajero;
