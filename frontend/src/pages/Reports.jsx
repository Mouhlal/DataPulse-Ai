import { Printer } from 'lucide-react';
import Analysis from './Analysis';

export default function Reports() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <h2 className="text-3xl font-bold text-white tracking-tight">Full Dataset Report</h2>
        <button onClick={() => window.print()} className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center gap-2">
           <Printer className="w-5 h-5"/> Extract to PDF
        </button>
      </div>

      <div className="report-container">
         <Analysis />
      </div>
    </div>
  )
}
