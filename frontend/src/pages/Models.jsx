import { BrainCircuit, Settings2, PlayCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Models() {
  const [runningKmeans, setRunningKmeans] = useState(false);
  const [runningRegression, setRunningRegression] = useState(false);
  const [runningClassification, setRunningClassification] = useState(false);
  const [result, setResult] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [targetCol, setTargetCol] = useState('');
  const [classTargetCol, setClassTargetCol] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/datasets/').then(res => {
      if(res.data.length > 0) setDatasetId(res.data[0].id);
    });
  }, []);

  const handleRunKMeans = async () => {
    if(!datasetId) return alert('No dataset available');
    setRunningKmeans(true);
    try {
      const res = await axios.post('http://localhost:8000/api/models/kmeans/', { dataset_id: datasetId, n_clusters: 3 });
      setResult({
        accuracy: res.data.inertia ? 'Inertia: '+res.data.inertia : 'Optimized',
        clusters: res.data.n_clusters,
        status: 'Optimal Convergence Reached',
        message: 'K-Means clustering algorithm successfully partitioned your dataset into segments.',
        raw: res.data
      });
    } catch (e) { alert(e.response?.data?.error || 'Error running K-Means'); }
    finally { setRunningKmeans(false); }
  };

  const handleRunRegression = async () => {
    if(!datasetId) return alert('No dataset available. Please upload one via Dashboard.');
    if(!targetCol) return alert('Please enter a Target Column name to predict.');
    setRunningRegression(true);
    try {
      const res = await axios.post('http://localhost:8000/api/models/regression/', { dataset_id: datasetId, target_col: targetCol });
      setResult({
        accuracy: `R² = ${res.data.r2_score}`,
        clusters: 'N/A',
        status: 'Regression Complete',
        message: `Linear Regression predicted '${res.data.target}' using ${res.data.features_used.length} features. MSE: ${res.data.mse}`,
        raw: res.data
      });
    } catch (e) { alert(e.response?.data?.error || 'Error running Regression. Double check column name.'); }
    finally { setRunningRegression(false); }
  };

  const handleRunClassification = async () => {
    if(!datasetId) return alert('No dataset available. Please upload one via Dashboard.');
    if(!classTargetCol) return alert('Please enter a Target Column name to classify.');
    setRunningClassification(true);
    try {
      const res = await axios.post('http://localhost:8000/api/models/classification/', { dataset_id: datasetId, target_col: classTargetCol });
      setResult({
        accuracy: `Accuracy = ${(res.data.accuracy * 100).toFixed(1)}%`,
        clusters: 'N/A',
        status: 'Classification Complete',
        message: `Logistic Regression classified '${res.data.target}' using ${res.data.features_used.length} features.`,
        raw: res.data
      });
    } catch (e) { alert(e.response?.data?.error || 'Error running Classification. Target must exist.'); }
    finally { setRunningClassification(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">AI Models & Predictions</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model Card 1 */}
        <div className="glass p-6 rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-primary/20 rounded-full blur-[50px] group-hover:bg-primary/40 transition-colors"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-primary/20 text-primary rounded-xl"><BrainCircuit className="w-6 h-6"/></div>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">Ready</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">K-Means Clustering</h3>
          <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">Automatically discover hidden segments and cohorts within your unlabelled data.</p>
          
          <button 
            onClick={handleRunKMeans}
            disabled={runningKmeans || !datasetId}
            className="w-full py-3 bg-white/10 hover:bg-primary text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
          >
            {runningKmeans ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : <><PlayCircle className="w-4 h-4"/> Run Model</>}
          </button>
        </div>

        {/* Model Card 2 */}
        <div className="glass p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 text-slate-300 rounded-xl"><Settings2 className="w-6 h-6"/></div>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">Needs Config</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Linear Regression</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-grow">Predict continuous target variables based on historical correlated features.</p>
          
          <input 
            type="text" 
            placeholder="Target Column (e.g. Sales)" 
            value={targetCol}
            onChange={(e) => setTargetCol(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white mb-3 focus:outline-none focus:border-primary/50" 
          />
          
          <button 
             onClick={handleRunRegression}
             disabled={runningRegression || !datasetId}
             className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors border border-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
             {runningRegression ? <><Loader2 className="w-4 h-4 animate-spin"/> Training...</> : 'Launch Regression'}
          </button>
        </div>

        {/* Model Card 3 */}
        <div className="glass p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 text-slate-300 rounded-xl"><BrainCircuit className="w-6 h-6"/></div>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">Needs Config</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Logistic Classification</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-grow">Categorize targets and predict probabilities based on historical features.</p>
          
          <input 
            type="text" 
            placeholder="Target Col (e.g. Purchased)" 
            value={classTargetCol}
            onChange={(e) => setClassTargetCol(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white mb-3 focus:outline-none focus:border-primary/50" 
          />
          
          <button 
             onClick={handleRunClassification}
             disabled={runningClassification || !datasetId}
             className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors border border-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
             {runningClassification ? <><Loader2 className="w-4 h-4 animate-spin"/> Training...</> : 'Launch Classification'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-8 glass p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 animate-in fade-in slide-in-from-bottom-4">
           <h3 className="text-2xl font-bold text-white mb-4">Model Results ({result.clusters} Clusters)</h3>
           <p className="text-slate-300 mb-6">{result.message}</p>
           <div className="flex gap-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-48">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</div>
                <div className="text-emerald-400 font-medium">{result.status}</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-48">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Confidence Score</div>
                <div className="text-white text-2xl font-bold">{result.accuracy}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
