import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, AlertCircle, Wand2, Download, PieChart as PieChartIcon, Grid } from 'lucide-react';
import React from 'react';

export default function Analysis() {
  const [dataset, setDataset] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const COLORS = ['#8b5cf6', '#22d3ee', '#3b82f6', '#ec4899', '#f59e0b'];

  const handleFixAutomatically = async () => {
    if (!dataset) return;
    setIsCleaning(true);
    try {
      const res = await axios.post('http://localhost:8000/api/datasets/clean/', { dataset_id: dataset.id });
      if (res.data.status === 'success') {
         window.location.reload();
      }
    } catch (err) {
      alert("Error cleaning the dataset: " + (err.response?.data?.error || err.message));
    } finally {
      setIsCleaning(false);
    }
  };

  useEffect(() => {
    // Fetch latest dataset for analysis demonstration
    axios.get('http://localhost:8000/api/datasets/').then(res => {
      if(res.data.length > 0) setDataset(res.data[0]);
    });
  }, []);

  if (!dataset) return <div className="text-slate-400 p-8 glass rounded-2xl">No datasets available for analysis.</div>;

  const missingData = dataset.summary?.missing_values 
    ? Object.keys(dataset.summary.missing_values).map(key => ({ name: key, count: dataset.summary.missing_values[key] })) 
    : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Active Analysis</h2>
           <p className="text-slate-400 text-sm mt-1">Analyzing: <span className="text-primary font-mono">{dataset.file_name}</span></p>
        </div>
        <div className="flex gap-3">
            <button 
               onClick={handleFixAutomatically} 
               disabled={isCleaning}
               className="px-4 py-2 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 print:hidden transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
               <Wand2 className={`w-4 h-4 ${isCleaning ? 'animate-spin' : ''}`} /> 
               {isCleaning ? 'Cleaning...' : 'Fix automatically'}
            </button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/20 print:hidden">Refresh</button>
            <a 
               href={`http://localhost:8000/api/datasets/${dataset.id}/download/`}
               download
               className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-emerald-500/30 print:hidden transition-all"
            >
               <Download className="w-4 h-4" /> Export Data
            </a>
        </div>
      </div>

      {dataset.summary?.error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 flex gap-4">
          <AlertCircle className="w-6 h-6" /> Error analyzing dataset: {dataset.summary.error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Missing Values Chart */}
          <div className="glass p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-accent w-5 h-5" /> Missing Values by Column
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false}/>
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dataset Profile */}
          <div className="glass p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            <h3 className="text-lg font-semibold text-white mb-6">Data Overview Profile</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="text-slate-400 text-sm mb-1">Total Rows</div>
                 <div className="text-2xl font-bold text-white">{dataset.summary?.rows || 0}</div>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="text-slate-400 text-sm mb-1">Variables (Cols)</div>
                 <div className="text-2xl font-bold text-white">{dataset.summary?.columns || 0}</div>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="text-slate-400 text-sm mb-1">Duplicates</div>
                 <div className="text-2xl font-bold text-rose-400">{dataset.summary?.duplicates || 0}</div>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="text-slate-400 text-sm mb-1">Size</div>
                 <div className="text-2xl font-bold text-white">{dataset.size_mb} MB</div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
