import React, { useState, useEffect } from 'react';
import { Folder, X, Minus, Activity, DownloadCloud, History, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadTask {
  gid: string;
  name: string;
  url: string;
  progress: number;
  speed: string;
  status: 'active' | 'complete' | 'error' | 'waiting';
  error?: string;
}

export default function App() {
  const [url, setUrl] = useState('https://sto.romsfast.com/Mods/PS2/Winning%20Eleven%209%20Oliver%20Benji%20[NTSC-J].zip');
  const [path, setPath] = useState('C:/Downloads/Abobi');
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [tab, setTab] = useState<'dl' | 'hist'>('dl');
  const [isAdding, setIsAdding] = useState(false);

  const startDownload = async () => {
    if (!url) return;
    setIsAdding(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder: path }),
      });
      const res = await response.json();
      if (res.status === 'success') {
        setUrl('');
        fetchQueue();
      } else {
        console.error("Erro ao adicionar:", res.message);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/queue');
      const list = await response.json();
      setDownloads(list);
    } catch (e) {
      // Backend might not be ready yet
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchQueue, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectFolder = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is not in standard TS types yet
      const directoryHandle = await window.showDirectoryPicker();
      if (directoryHandle) {
        setPath(directoryHandle.name);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Erro ao selecionar pasta:", err);
      }
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/clear-history', { method: 'POST' });
      fetchQueue();
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  const activeDownloads = downloads.filter(d => d.status !== 'error' && d.status !== 'complete');
  const completedDownloads = downloads.filter(d => d.status === 'complete');
  const errorDownloads = downloads.filter(d => d.status === 'error');

  return (
    <div className="h-screen w-screen p-4 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl h-[600px] mica-effect rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Title Bar */}
        <div className="h-12 bg-white/5 border-b border-white/10 flex justify-between items-center px-4 shrink-0">
          <div className="flex items-center gap-2 text-[#0078d4]">
            <DownloadCloud size={18} />
            <span className="font-bold text-xs tracking-[0.2em]">ABOBIDOWNLOADER</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400">
              <Minus size={16} />
            </button>
            <button className="p-1.5 hover:bg-red-500/80 hover:text-white rounded-md transition-colors text-gray-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-black/20 shrink-0">
          <button 
            onClick={() => setTab('dl')} 
            className={`flex-1 py-3 text-xs font-bold tracking-widest transition-all relative ${tab === 'dl' ? 'text-white' : 'text-gray-500 hover:bg-white/5'}`}
          >
            FILA DE DOWNLOADS
            {tab === 'dl' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0078d4]" />}
          </button>
          <button 
            onClick={() => setTab('hist')} 
            className={`flex-1 py-3 text-xs font-bold tracking-widest transition-all relative ${tab === 'hist' ? 'text-white' : 'text-gray-500 hover:bg-white/5'}`}
          >
            HISTÓRICO / ERROS
            {tab === 'hist' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {tab === 'dl' ? (
              <motion.div 
                key="dl" 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full gap-6"
              >
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                      <Folder size={18} className="text-[#0078d4]" />
                      <input 
                        value={path} 
                        onChange={e => setPath(e.target.value)} 
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-300"
                        placeholder="Caminho de download"
                      />
                    </div>
                    <button 
                      onClick={selectFolder}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 text-gray-300"
                      title="Escolher pasta"
                    >
                      <Folder size={16} />
                      ESCOLHER
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      placeholder="Cole a URL da ROM aqui..."
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && startDownload()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#0078d4] focus:bg-white/10 outline-none transition-all shadow-inner"
                    />
                    <button 
                      onClick={startDownload} 
                      disabled={isAdding || !url} 
                      className="bg-[#0078d4] hover:bg-[#006abc] disabled:opacity-50 px-8 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                    >
                      {isAdding ? <Loader2 className="animate-spin" size={16} /> : 'BAIXAR'}
                    </button>
                  </div>
                </div>

                {/* Download List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {activeDownloads.length === 0 && completedDownloads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                      <Activity size={48} />
                      <p className="text-xs uppercase tracking-widest font-bold">Nenhum download ativo</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {[...activeDownloads, ...completedDownloads].map(dl => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={dl.gid} 
                        className="glass-card p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 min-w-0">
                            {dl.status === 'complete' ? (
                              <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#0078d4] border-t-transparent animate-spin shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate" title={dl.name}>{dl.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#0078d4]">{dl.progress.toFixed(1)}%</span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${dl.status === 'complete' ? 'bg-green-400' : 'bg-[#0078d4] progress-glow'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${dl.progress}%` }}
                            transition={{ ease: "linear", duration: 0.5 }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <span>{dl.speed}</span>
                          <span className={dl.status === 'complete' ? 'text-green-400' : 'text-[#0078d4]'}>{dl.status}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="hist" 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full gap-4"
              >
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registros de Erros e Concluídos</span>
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 uppercase tracking-widest"
                  >
                    <Trash2 size={12} />
                    Limpar
                  </button>
                </div>
                <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-4 overflow-y-auto space-y-4">
                  {errorDownloads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                      <History size={48} />
                      <p className="text-xs uppercase tracking-widest font-bold">Nenhum erro registrado</p>
                    </div>
                  )}
                  {errorDownloads.map(err => (
                    <div key={err.gid} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-4">
                      <AlertCircle className="text-red-400 shrink-0" size={20} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-red-400 truncate">{err.name}</p>
                        <p className="text-xs text-red-300/70 mt-1">{err.error || 'Erro desconhecido'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
