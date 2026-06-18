import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DeviceList from './components/DeviceList';
import TelemetryPanel from './components/TelemetryPanel';
import AlertsConfig from './components/AlertsConfig';
import ErrorAlert from './components/ErrorAlert';

export default function App() {
  // Állapotok (State)
  const apiUrl = "http://api.167.233.130.203.nip.io/";
  const [activeTab, setActiveTab] = useState('devices');
  
  // Adatok
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [limit, setLimit] = useState(30);
  const [metrics, setMetrics] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  // Űrlap állapotok
  const [newDevice, setNewDevice] = useState({ device_id: '', name: '', room: '' });
  const [newMetric, setNewMetric] = useState({ temperature: 20, humidity: 50 });
  const [newLimit, setNewLimit] = useState(30);

  const [error, setError] = useState('');

  // Adatok betöltése
  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/devices`);
      if (res.ok) setDevices(await res.json());
    } catch (error) { console.error(error); }
  }, [apiUrl]);

  const fetchAlertsAndRules = useCallback(async () => {
    try {
      const rulesRes = await fetch(`${apiUrl}/api/rules`);
      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setLimit(data.temperature_limit);
        setNewLimit(data.temperature_limit);
      }
      const alertsRes = await fetch(`${apiUrl}/api/alerts`);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
    } catch (error) { console.error(error); }
  }, [apiUrl]);

  const fetchMetrics = useCallback(async (deviceId) => {
    try {
      const res = await fetch(`${apiUrl}/api/telemetry/${deviceId}`);
      if (res.ok) setMetrics(await res.json());
    } catch (error) { console.error(error); }
  }, [apiUrl]);

  // Kezdeti betöltés
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (apiUrl) {
      fetchDevices();
      fetchAlertsAndRules();
    }
  }, [apiUrl, fetchDevices, fetchAlertsAndRules]);

  useEffect(() => {
    if (selectedDevice && activeTab === 'telemetry') {
      fetchMetrics(selectedDevice);
    }
  }, [selectedDevice, activeTab, fetchMetrics]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Akciók
  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiUrl}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDevice, type: 'temperature' })
      });
      setNewDevice({ device_id: '', name: '', room: '' });
      fetchDevices();
    } catch { setError('Hiba az eszköz hozzáadásakor'); }
  };

  const handleSendMetric = async (e) => {
    e.preventDefault();
    if (!selectedDevice) return alert('Válassz ki egy eszközt!');
    try {
      await fetch(`${apiUrl}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: selectedDevice, ...newMetric })
      });
      fetchMetrics(selectedDevice);
      setTimeout(fetchAlertsAndRules, 500); 
    } catch { setError('Hiba a mérés beküldésekor'); }
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiUrl}/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature_limit: parseFloat(newLimit) })
      });
      fetchAlertsAndRules();
    } catch { setError('Hiba a szabály frissítésekor'); }
  }; 

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans text-gray-800 flex flex-row">
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Fő tartalom */}
      <div className="flex-1 min-w-0 w-full p-8 overflow-y-auto max-h-screen">
        {/* Error Alert Component */}
        {error && (
          <ErrorAlert 
            error={error}
            onClose={() => setError('')}
          />
        )}

        {/* ESZKÖZÖK NÉZET */}
        {activeTab === 'devices' && (
          <DeviceList 
            apiUrl={apiUrl}
            devices={devices}
            fetchDevices={fetchDevices}
            newDevice={newDevice}
            setNewDevice={setNewDevice}
            handleAddDevice={handleAddDevice}
          />
        )}

        {/* TELEMETRIA NÉZET */}
        {activeTab === 'telemetry' && (
          <TelemetryPanel 
            apiUrl={apiUrl}
            devices={devices}
            selectedDevice={selectedDevice}
            setSelectedDevice={setSelectedDevice}
            newMetric={newMetric}
            setNewMetric={setNewMetric}
            metrics={metrics}
            fetchMetrics={fetchMetrics}
            handleSendMetric={handleSendMetric}
          />
        )}

        {/* SZABÁLYOK ÉS RIASZTÁSOK NÉZET */}
        {activeTab === 'alerts' && (
          <AlertsConfig 
            apiUrl={apiUrl}
            limit={limit}
            newLimit={newLimit}
            setNewLimit={setNewLimit}
            alerts={alerts}
            fetchAlertsAndRules={fetchAlertsAndRules}
            handleUpdateLimit={handleUpdateLimit}
          />
        )}

      </div>
    </div>
  );
}