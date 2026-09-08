import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] mix-blend-screen" />
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-secondary/20 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Navbar-like quick links */}
        <div className="absolute top-0 w-full flex justify-between items-center py-4 px-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md mb-24">
          <div className="font-bold text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent"></div>
            NexAI Analyst
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors font-medium">Log In</Link>
            <Link to="/dashboard" className="px-5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-200 transition-colors font-semibold">Start Free</Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-32 p-12 rounded-[2rem] w-full max-w-5xl flex flex-col items-center glass">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-light text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            v2.0 Beta out now
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Turn your data into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              actionable intelligence.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-3xl leading-relaxed">
            Upload CSV datasets and let our advanced Machine Learning pipeline automatically clean, analyze, visualize, and extract predictive insights in seconds.
          </p>
          
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              Launch Dashboard
            </Link>
            <button className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
