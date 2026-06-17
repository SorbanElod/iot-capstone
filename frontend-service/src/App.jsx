import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_API_URL, API_ENDPOINTS } from './constants/api';
import { useFetch } from './hooks/useFetch';
import { DeviceList } from './components/DeviceList';
import { TelemetryPanel } from './components/TelemetryPanel';
import { AlertsConfig } from './components/AlertsConfig';
import { Sidebar } from './components/Sidebar';
import { ErrorAlert } from './components/ErrorAlert';

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');
  const { fetchData } = useFetch(apiUrl, setError);

  const fetchDevices = useCallback(async () => {
    const data = await fetchData(API_ENDPOINTS.DEVICES);
    if (data) {
      setDevices(Array.isArray(data) ? data : []);
    }
  }, [fetchData]);

  useEffect(() => {
    if (apiUrl && apiUrl !== 'http://116.203.x.x') {
      const loadDevices = async () => {
        const data = await fetchData(API_ENDPOINTS.DEVICES);
        if (data) {
          setDevices(Array.isArray(data) ? data : []);
        }
      };
      loadDevices();
    }
  }, [apiUrl, fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col md:flex-row">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <ErrorAlert error={error} onDismiss={() => setError('')} />

        {activeTab === 'devices' && (
          <DeviceList
            apiUrl={apiUrl}
            devices={devices}
            fetchDevices={fetchDevices}
            setError={setError}
          />
        )}
        
        {activeTab === 'telemetry' && (
          <TelemetryPanel
            apiUrl={apiUrl}
            devices={devices}
            setError={setError}
          />
        )}
        
        {activeTab === 'alerts' && (
          <AlertsConfig
            apiUrl={apiUrl}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}