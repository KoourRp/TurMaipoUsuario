import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { getDistance } from 'geolib';
import L from 'leaflet';

const MapaPasajero = () => {
  const [busStops, setBusStops] = useState<any[]>([]);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [busLocation, setBusLocation] = useState<any | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.432418, -70.619549]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const stopIcon = new L.Icon({
    iconUrl: '/icons/bus-stop.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });


  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const busIcon = new L.Icon({
    iconUrl: 'https://tse2.mm.bing.net/th?id=OIP._AF9CtzE5XKPksuXxdPBBQHaHa&w=474&h=474&c=7',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  

  useEffect(() => {
  const allowed = true;
  if (!allowed) {
    window.location.href = '/';
  }
}, []);


  useEffect(() => {
    const fetchBusStops = async () => {
      const { data } = await supabase.from('bus_stops').select('*');
      if (data) setBusStops(data);
    };
    fetchBusStops();
  }, []);

  useEffect(() => {
  let timeout: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      window.location.href = '/';
    }, 2 * 60 * 1000); // 2 minutos
  };

  // Eventos que reinician el temporizador
  const events = ['mousemove', 'keydown', 'click', 'scroll'];

  events.forEach((event) => window.addEventListener(event, resetTimer));

  // Inicia el temporizador al montar
  resetTimer();

  return () => {
    clearTimeout(timeout);
    events.forEach((event) => window.removeEventListener(event, resetTimer));
  };
}, []);


  useEffect(() => {
    if (!selectedStop) return;

    const fetchBusData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data: ra } = await supabase
          .from('route_assignment')
          .select('bus_id')
          .eq('route_id', selectedStop.route_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!ra || ra.length === 0) {
          setErrorMsg('No hay micro asignada a esta ruta.');
          setLoading(false);
          return;
        }

        const busId = ra[0].bus_id;

        const { data: busData } = await supabase
          .from('bus_location')
          .select('*')
          .eq('bus_id', busId)
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (!busData) {
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
      }

      setLoading(false);
    };

    const interval = setInterval(fetchBusData, 5000);
    fetchBusData();
    return () => clearInterval(interval);
  }, [selectedStop]);

  useEffect(() => {
    const fallbackCoords: [number, number] = [-33.432418, -70.619549]; //ambiar la wea
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setUserLocation([latitude, longitude]);
      },
      (err) => {
        setErrorMsg("No pudimos acceder a tu ubicación.\nUsando ubicación por defecto.");
        setMapCenter(fallbackCoords);
        setUserLocation(fallbackCoords);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {errorMsg && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg z-[2000] transition-opacity duration-300"
          style={{ color: 'white', animation: 'fadeOut 5s forwards' }}
        >
          ⚠️ {errorMsg}
        </div>
      )}
      {loading && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm z-[1000]">
          Buscando ubicación...
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />

        {busStops.map((stop) =>
          (stop.stops_json?.features || []).map((feature: any, index: number) => {
            const [lng, lat] = feature.geometry.coordinates;
            return (
              <Marker
                key={`${stop.id}-${index}`}
                position={[lat, lng]}
                icon={stopIcon}
                eventHandlers={{
                  click: () =>
                    setSelectedStop({ lat, lng, route_id: stop.route_id }),
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
          })
        )}

        {busLocation && (
          <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
            <Popup>🚌 Micro actual</Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>📍 Tu ubicación</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapaPasajero;
