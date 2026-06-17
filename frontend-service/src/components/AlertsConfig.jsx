import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '../constants/api';
import { useFetch } from '../hooks/useFetch';

export const AlertsConfig = ({ apiUrl, setError }) => {
  const [alerts, setAlerts] = useState([]);
  const [limit, setLimit] = useState(30);
  const [newLimit, setNewLimit] = useState(30);
  const { fetchData } = useFetch(apiUrl, setError);

  const fetchAlertsAndRules = async () => {
    try {
      // Fetch rules
      const rulesData = await fetchData(API_ENDPOINTS.RULES);
      if (rulesData && rulesData.temperature_limit) {
        setLimit(rulesData.temperature_limit);
        setNewLimit(rulesData.temperature_limit);
      }

      // Fetch alerts
      const alertsData = await fetchData(API_ENDPOINTS.ALERTS);
      if (alertsData) {
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      }
    } catch (err) {
      console.error('Error fetching alerts and rules:', err);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchAlertsAndRules();
  }, [apiUrl]);

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (isNaN(newLimit) || newLimit < 0) {
      setError('Kérlek, adj meg egy érvényes hőmérsékleti értéket!');
      return;
    }

    try {
      const result = await fetchData(API_ENDPOINTS.RULES, {
        method: 'POST',
        body: JSON.stringify({ temperature_limit: parseFloat(newLimit) }),
      });

      if (result) {
        await fetchAlertsAndRules();
      }
    } catch (err) {
      setError('Hiba a szabály frissítésekor');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Szabálymotor & Riasztások</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rule configuration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-bold mb-4 text-slate-800">
            Aktuális Riasztási Limit
          </h3>
          <div className="text-4xl font-black text-red-500 mb-6">{limit} °C</div>
          
          <form onSubmit={handleUpdateLimit} className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Új limit megadása:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-lg font-semibold transition-colors"
              >
                Mentés
              </button>
            </div>
          </form>
        </div>

        {/* Alerts list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle size={20} /> Aktív Riasztások
            </h3>
            <button 
              onClick={fetchAlertsAndRules} 
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Riasztások frissítése"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="p-0 max-h-[500px] overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="p-8 text-center text-slate-500">
                Nincsenek aktív riasztások a rendszerben.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {alerts.map((alert, i) => (
                  <li key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-red-600">{alert.device_id}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(alert.timestamp).toLocaleString('hu-HU')}
                      </span>
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
  );
};
