import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Trash2, ExternalLink } from 'lucide-react';

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/datasets/');
      setDatasets(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/datasets/${id}/`);
      setDatasets(datasets.filter(d => d.id !== id));
    } catch (error) {
      alert("Failed to delete dataset");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Your Datasets</h2>
        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">{datasets.length} Total</span>
      </div>

      <div className="glass rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
            <tr>
              <th scope="col" className="px-6 py-4">File Name</th>
              <th scope="col" className="px-6 py-4">Size (MB)</th>
              <th scope="col" className="px-6 py-4">Uploaded</th>
              <th scope="col" className="px-6 py-4">Health (Rows)</th>
              <th scope="col" className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading datasets...</td></tr>
            ) : datasets.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No datasets uploaded yet. Head to the Dashboard to upload one.</td></tr>
            ) : (
              datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    {ds.file_name}
                  </td>
                  <td className="px-6 py-4">{ds.size_mb} MB</td>
                  <td className="px-6 py-4">{new Date(ds.uploaded_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {ds.summary?.error ? (
                      <span className="text-rose-400 text-xs">Analysis Failed</span>
                    ) : (
                      <span className="text-emerald-400">{ds.summary?.rows || 0} rows</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button className="text-slate-400 hover:text-accent transition-colors hidden"><ExternalLink className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(ds.id)} className="text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
