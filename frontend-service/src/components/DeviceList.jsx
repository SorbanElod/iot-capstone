import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export default function DeviceList({ 
  devices, 
  fetchDevices,
  newDevice,
  setNewDevice,
  handleAddDevice,
  handleDeleteDevice
}) {
  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center justify-between">
        Regisztrált Eszközök
        <button 
          onClick={fetchDevices} 
          className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors"
          aria-label="Eszközök frissítése"
        >
          <RefreshCw size={20} />
        </button>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eszköz lista táblázat */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">ID</th>
                <th className="p-4 font-semibold text-slate-600">Név</th>
                <th className="p-4 font-semibold text-slate-600">Szoba</th>
                <th className="p-4 font-semibold text-slate-600 text-center">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Nincsenek regisztrált eszközök
                  </td>
                </tr>
              ) : (
                devices.map((d) => (
                  <tr key={d.device_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-blue-600">{d.device_id}</td>
                    <td className="p-4">{d.name}</td>
                    <td className="p-4 text-slate-500">{d.room}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteDevice(d.device_id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors"
                        aria-label="Eszköz törlése"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Új eszköz űrlap */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus size={18} /> Új eszköz
          </h3>
          <form onSubmit={handleAddDevice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Eszköz ID
              </label>
              <input
                required
                type="text"
                value={newDevice.device_id}
                onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="pl. sensor-02"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Név
              </label>
              <input
                required
                type="text"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="pl. Konyhai Hőmérő"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Szoba
              </label>
              <input
                required
                type="text"
                value={newDevice.room}
                onChange={(e) => setNewDevice({ ...newDevice, room: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="pl. Konyha"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Regisztrálás
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}