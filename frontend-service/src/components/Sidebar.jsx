import { Activity, Server, AlertTriangle } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, apiUrl, setApiUrl }) {
  return (
    <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col shadow-xl flex-shrink-0">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Activity className="text-blue-400" /> IoT Panel
      </h1>
      
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab('devices')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'devices' ? 'bg-blue-700' : 'hover:bg-blue-500'
          }`}
        >
          <Server size={20} /> Eszközök
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'telemetry' ? 'bg-blue-700' : 'hover:bg-blue-500'
          }`}
        >
          <Activity size={20} /> Telemetria
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'alerts' ? 'bg-blue-700' : 'hover:bg-blue-500'
          }`}
        >
          <AlertTriangle size={20} /> Szabályok
        </button>
      </nav>

      <div className="mt-auto pt-8">
        <label className="text-xs text-slate-400 uppercase font-semibold">
          API Szerver URL
        </label>
        <input 
          type="text" 
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full mt-1 bg-slate-800 text-sm border-none rounded p-2 text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
          placeholder="http://IP_CIM"
        />
      </div>
    </div>
  );
}

