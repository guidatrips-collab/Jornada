import { motion } from 'motion/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function RoomLobby() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const worldId = searchParams.get('world') || 'couple_trip';

  // Real app: We would subscribe to Firestore room changes here
  // and see when players join.

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel rounded-3xl p-8 max-w-md w-full text-center relative z-10"
      >
        <h2 className="font-cursive text-4xl text-white mb-2">Sala Criada!</h2>
        <p className="text-slate-300 text-sm mb-8">
          Mundo: <span className="font-bold text-orange-400 capitalize">{worldId.replace('_', ' ')}</span>
        </p>

        <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-xl">
          <QRCodeSVG 
            value={`${window.location.origin}/room/${id}`} 
            size={200}
            fgColor="#0f172a"
          />
        </div>

        <p className="text-slate-400 text-sm mb-2">Ou compartilhe o código:</p>
        <div className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-3xl text-white tracking-widest uppercase mb-8">
          {id}
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center font-bold text-lg shadow-lg mb-2 border-2 border-slate-900">
              A
            </div>
            <span className="text-xs text-slate-300">Você</span>
          </div>
          <div className="w-8 h-px bg-white/20"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mb-2">
              <span className="text-white/50 text-xs">...</span>
            </div>
            <span className="text-xs text-slate-400">Aguardando</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = `/game/${id}`}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all"
        >
          Iniciar Partida
        </button>
      </motion.div>
    </div>
  );
}
