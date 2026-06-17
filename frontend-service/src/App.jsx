import React, { useState, useEffect } from 'react';
import { Settings, Server, Activity, AlertTriangle, Plus, Thermometer, Droplets, RefreshCw } from 'lucide-react';

export default function App() {
  // Állapotok (State)
  const [apiUrl, setApiUrl] = useState('http://116.203.x.x'); // Ide írd majd a Hetzner IP-det!
  const [activeTab, setActiveTab] = useState('devices');
  
  // Adatok
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [limit, setLimit] = useState(30);
  const [metrics, setMetrics] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  // Űrlap állapotok
  const [newDevice, setNewDevice] = useState({ device_id: '', name: '', location: '' });
  const [newMetric, setNewMetric] = useState({ temperature: 20, humidity: 50 });
  const [newLimit, setNewLimit] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Adatok betöltése
  const fetchDevices = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/devices`);
      if (res.ok) setDevices(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAlertsAndRules = async () => {
    try {
      const rulesRes = await fetch(`${apiUrl}/api/rules`);
      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setLimit(data.temperature_limit);
        setNewLimit(data.temperature_limit);
      }
      const alertsRes = await fetch(`${apiUrl}/api/alerts`);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
    } catch (err) { console.error(err); }
  };

  const fetchMetrics = async (deviceId) => {
    try {
      const res = await fetch(`${apiUrl}/api/telemetry/${deviceId}`);
      if (res.ok) setMetrics(await res.json());
    } catch (err) { console.error(err); }
  };

  // Kezdeti betöltés
  useEffect(() => {
    if (apiUrl !== 'http://116.203.x.x') {
      fetchDevices();
      fetchAlertsAndRules();
    }
  }, [apiUrl, activeTab]);

  useEffect(() => {
    if (selectedDevice && activeTab === 'telemetry') {
      fetchMetrics(selectedDevice);
    }
  }, [selectedDevice, activeTab]);

  // Akciók
  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiUrl}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDevice, type: 'temperature' })
      });
      setNewDevice({ device_id: '', name: '', location: '' });
      fetchDevices();
    } catch (err) { setError('Hiba az eszköz hozzáadásakor'); }
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
      // Frissítjük a riasztásokat is a háttérben
      setTimeout(fetchAlertsAndRules, 500); 
    } catch (err) { setError('Hiba a mérés beküldésekor'); }
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
    } catch (err) { setError('Hiba a szabály frissítésekor'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Activity className="text-blue-400" /> IoT Panel
        </h1>
        
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('devices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'devices' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Server size={20} /> Eszközök
          </button>
          <button 
            onClick={() => setActiveTab('telemetry')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'telemetry' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Activity size={20} /> Telemetria
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'alerts' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <AlertTriangle size={20} /> Szabályok & Riasztások
          </button>
        </div>

        <div className="mt-auto pt-8">
          <label className="text-xs text-slate-400 uppercase font-semibold">API Szerver URL</label>
          <input 
            type="text" 
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full mt-1 bg-slate-800 text-sm border-none rounded p-2 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="http://IP_CIM"
          />
        </div>
      </div>

      {/* Fő tartalom */}
      <div className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* --- ESZKÖZÖK NÉZET --- */}
        {activeTab === 'devices' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center justify-between">
              Regisztrált Eszközök
              <button onClick={fetchDevices} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full"><RefreshCw size={20} /></button>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Eszköz lista */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600">ID</th>
                      <th className="p-4 font-semibold text-slate-600">Név</th>
                      <th className="p-4 font-semibold text-slate-600">Helyszín</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.length === 0 ? (
                      <tr><td colSpan="3" className="p-8 text-center text-slate-500">Nincsenek regisztrált eszközök</td></tr>
                    ) : (
                      devices.map((d, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-mono text-sm text-blue-600">{d.device_id}</td>
                          <td className="p-4">{d.name}</td>
                          <td className="p-4 text-slate-500">{d.location}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Új eszköz hozzáadása */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Új eszköz</h3>
                <form onSubmit={handleAddDevice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eszköz ID</label>
                    <input required type="text" value={newDevice.device_id} onChange={e => setNewDevice({...newDevice, device_id: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="pl. sensor-02" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Név</label>
                    <input required type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="pl. Konyhai Hőmérő" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Helyszín</label>
                    <input required type="text" value={newDevice.location} onChange={e => setNewDevice({...newDevice, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="pl. Konyha" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Regisztrálás
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- TELEMETRIA NÉZET --- */}
        {activeTab === 'telemetry' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Telemetria Szimulátor</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Válaszd ki az eszközt a méréshez:</label>
              <select 
                className="w-full md:w-1/2 border border-slate-300 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                <option value="">-- Válassz eszközt --</option>
                {devices.map(d => (
                  <option key={d.device_id} value={d.device_id}>{d.name} ({d.device_id})</option>
                ))}
              </select>
            </div>

            {selectedDevice && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mérés küldése (Szimulátor) */}
                <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Adat beküldése</h3>
                  <form onSubmit={handleSendMetric} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1"><Thermometer size={16}/> Hőmérséklet (°C)</label>
                      <input type="number" step="0.1" value={newMetric.temperature} onChange={e => setNewMetric({...newMetric, temperature: parseFloat(e.target.value)})} className="w-full border border-blue-200 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1"><Droplets size={16}/> Páratartalom (%)</label>
                      <input type="number" value={newMetric.humidity} onChange={e => setNewMetric({...newMetric, humidity: parseFloat(e.target.value)})} className="w-full border border-blue-200 rounded-lg p-2 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform active:scale-95">
                      Küldés
                    </button>
                  </form>
                </div>

                {/* Utolsó mérések */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4 flex justify-between items-center">
                    Legutóbbi mérések
                    <button onClick={() => fetchMetrics(selectedDevice)} className="text-slate-400 hover:text-slate-600"><RefreshCw size={18} /></button>
                  </h3>
                  {metrics.length === 0 ? (
                    <p className="text-slate-500 italic">Nincsenek mérések ehhez az eszközhöz.</p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex gap-4">
                            <span className="font-bold text-slate-800">{m.temperature}°C</span>
                            <span className="text-slate-500">{m.humidity}% pára</span>
                          </div>
                          <span className="text-xs text-slate-400">{new Date(m.timestamp).toLocaleString('hu-HU')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SZABÁLYOK ÉS RIASZTÁSOK NÉZET --- */}
        {activeTab === 'alerts' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Szabálymotor & Riasztások</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Limit beállítása */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Aktuális Riasztási Limit</h3>
                <div className="text-4xl font-black text-red-500 mb-6">{limit} °C</div>
                
                <form onSubmit={handleUpdateLimit} className="border-t border-slate-100 pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Új limit megadása:</label>
                  <div className="flex gap-2">
                    <input type="number" step="0.1" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-lg font-semibold">Mentés</button>
                  </div>
                </form>
              </div>

              {/* Riasztások listája */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-red-800 flex items-center gap-2"><AlertTriangle size={20} /> Aktív Riasztások</h3>
                  <button onClick={fetchAlertsAndRules} className="text-red-500 hover:text-red-700"><RefreshCw size={18} /></button>
                </div>
                
                <div className="p-0 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="p-8 text-center text-slate-500">Nincsenek aktív riasztások a rendszerben.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {alerts.map((alert, i) => (
                        <li key={i} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-red-600">{alert.device_id}</span>
                            <span className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString('hu-HU')}</span>
                          </div>
                          <p className="text-slate-800 text-sm">{alert.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}