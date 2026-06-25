import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDisputes()
      .then(setDisputes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    OPEN: 'badge-yellow',
    IN_REVIEW: 'badge-blue',
    RESOLVED: 'badge-green',
    ESCALATED: 'badge-red',
  };

  return (
    <Layout showBack title="Support">
      <h2 className="font-semibold text-lg mb-4">My Requests</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No support requests</p>
          <p className="text-sm text-gray-400 mt-1">Issues you raise will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{d.category?.replace('_', ' ').toLowerCase()}</span>
                <span className={statusColors[d.status] || 'badge'}>{d.status}</span>
              </div>
              <p className="text-sm text-gray-600">{d.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {d.responseSla
                  ? `Response by ${new Date(d.responseSla).toLocaleDateString()}`
                  : 'Awaiting review'}
              </div>
              {d.resolution && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {d.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
