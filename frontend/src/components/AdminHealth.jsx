import React, { useState, useEffect } from 'react';
import { getHealthCheck } from '../services/api';

const StatusIndicator = ({ status }) => {
  const isHealthy = status === 'up' || status === 'healthy';
  const text = isHealthy ? 'Operativo' : 'Caído';
  const colorClasses = isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  
  return (
    <span className={`px-3 py-1 text-sm font-bold rounded-full ${colorClasses}`}>
      {text}
    </span>
  );
};

const AdminHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      const data = await getHealthCheck();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Estado del Sistema</h1>
        <button 
          onClick={fetchHealthData} 
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Estado'}
        </button>
      </div>

      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}

      {healthData && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-semibold">Estado General</h2>
              <p className="text-sm text-gray-500">Última comprobación: {new Date(healthData.timestamp).toLocaleString()}</p>
            </div>
            <StatusIndicator status={healthData.status} />
          </div>

          <h3 className="text-xl font-semibold mb-6">Estado de los Componentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(healthData.checks).map(([key, value]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-700 capitalize">{key.replace('_', ' ')}</h4>
                  <StatusIndicator status={value.status} />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {Object.entries(value).map(([prop, val]) => (
                    prop !== 'status' && (
                      <p key={prop}>
                        <span className="font-semibold">{prop}:</span> {JSON.stringify(val)}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHealth;