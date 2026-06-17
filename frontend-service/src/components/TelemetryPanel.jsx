import { Thermometer, Droplets, RefreshCw } from 'lucide-react';

export default function TelemetryPanel({
  devices,
  selectedDevice,
  setSelectedDevice,
  newMetric,
  setNewMetric,
  metrics,
  fetchMetrics,
  handleSendMetric
}) {
  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Telemetria Szimulátor</h2>
      
      {/* Device selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Válaszd ki az eszközt a méréshez:
        </label>
        <select 
          className="w-full md:w-1/2 border border-slate-300 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">-- Válassz eszközt --</option>
          {devices.map((d) => (
            <option key={d.device_id} value={d.device_id}>
              {d.name} ({d.device_id})
            </option>
          ))}
        </select>
      </div>

      {selectedDevice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send metric form */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100 h-fit">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Adat beküldése</h3>
            <form onSubmit={handleSendMetric} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                  <Thermometer size={16} /> Hőmérséklet (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMetric.temperature}
                  onChange={(e) => setNewMetric({ ...newMetric, temperature: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-blue-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                  <Droplets size={16} /> Páratartalom (%)
                </label>
                <input
                  type="number"
                  value={newMetric.humidity}
                  onChange={(e) => setNewMetric({ ...newMetric, humidity: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-blue-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform active:scale-95"
              >
                Küldés
              </button>
            </form>
          </div>

          {/* Metrics list */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 flex justify-between items-center">
              Legutóbbi mérések
              <button 
                onClick={() => fetchMetrics(selectedDevice)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Mérések frissítése"
              >
                <RefreshCw size={18} />
              </button>
            </h3>
            {metrics.length === 0 ? (
              <p className="text-slate-500 italic">
                Nincsenek mérések ehhez az eszközhöz.
              </p>
            ) : (
              <div className="space-y-3">
                {metrics.map((m, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex gap-4">
                      <span className="font-bold text-slate-800">{m.temperature}°C</span>
                      <span className="text-slate-500">{m.humidity}% pára</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(m.timestamp).toLocaleString('hu-HU')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
