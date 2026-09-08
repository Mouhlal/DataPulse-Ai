import { UploadCloud, FileSpreadsheet, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const dummyData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 },
];

export default function Dashboard() {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/datasets/');
      setDatasets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/datasets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Server response:', response.data);
      alert('Upload successful! AI Summary generated.');
      fetchDatasets();
    } catch (error) {
      console.error(error);
      alert('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {datasets.length > 0 && datasets[0].summary?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group">
             <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-emerald-500/20 rounded-full blur-[50px] group-hover:bg-emerald-500/40 transition-colors"></div>
             <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2"><Zap className="w-5 h-5"/> Prediction: Next Month's Best Seller</h3>
             <div className="text-3xl font-bold text-white mt-4">{datasets[0].summary.metrics.predicted_best || "Not enough chronological data"}</div>
             <p className="text-sm text-slate-400 mt-2">Calculated using linear time-series forecasting</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-accent/30 bg-accent/5">
             <h3 className="text-accent font-semibold mb-2">Historical Best Selling Product</h3>
             <div className="text-3xl font-bold text-white mt-4">{datasets[0].summary.metrics.best_seller || "Data unavailable"}</div>
             <p className="text-sm text-slate-400 mt-2">Highest cumulative volume sold to date</p>
          </div>
        </div>
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 text-primary">
              <FileSpreadsheet className="w-6 h-6"/>
            </div>
            <h3 className="text-lg font-medium text-slate-300">Total Datasets</h3>
          </div>
          <div className="text-4xl font-bold text-white">{datasets.length}</div>
          <p className="text-sm text-emerald-400 mt-2">Active processing context</p>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-accent/20 text-accent">
              <Activity className="w-6 h-6"/>
            </div>
            <h3 className="text-lg font-medium text-slate-300">Data Points Scanned</h3>
          </div>
          <div className="text-4xl font-bold text-white">
             {datasets.reduce((sum, ds) => sum + (ds.summary?.rows || 0), 0).toLocaleString()}
          </div>
          <p className="text-sm text-emerald-400 mt-2">Rows analyzed globally</p>
        </div>

        <div 
          className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-primary/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={handleUploadClick}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFileChange} />
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className={`w-8 h-8 text-primary ${uploading ? 'animate-bounce' : ''}`} />
          </div>
          <span className="font-semibold text-lg text-white">{uploading ? 'Analyzing...' : 'Upload New Dataset'}</span>
          <span className="text-sm text-slate-400">CSV, Excel, JSON up to 50MB</span>
        </div>
      </div>

      {/* Main Analysis Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-semibold text-white">
                {datasets.length > 0 ? `Feature Distribution (${datasets[0].file_name.replace('.csv','')})` : "Predictive Trend (Demo)"}
             </h3>
             <button onClick={() => window.print()} className="text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors print:hidden">Generate Report</button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Inject dynamic dataset feature means, or fallback to dummyData */}
              <AreaChart 
                 data={datasets.length > 0 && datasets[0].summary?.numeric_stats ? Object.entries(datasets[0].summary.numeric_stats).map(([k, v]) => ({ name: k.substring(0,8), value: v.mean || 0 })) : dummyData} 
                 margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-primary/10 to-transparent overflow-y-auto max-h-[350px]">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="text-accent w-5 h-5" /> AI Insights
          </h3>
          <div className="space-y-4">
            {datasets.length === 0 ? (
               <p className="text-slate-400 text-sm">Upload a dataset to generate real insights.</p>
            ) : datasets[0].summary?.insights?.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-emerald-400 text-sm mb-1">Observation</h4>
                <p className="text-sm text-slate-300">{insight}</p>
              </div>
            ))}
            
            {datasets.length > 0 && datasets[0].summary?.error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <h4 className="font-medium text-rose-400 text-sm mb-1">Analysis Error</h4>
                <p className="text-sm text-slate-300">{datasets[0].summary.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
