import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Play, QrCode, Sparkles, Tent, Home, Users, Briefcase } from 'lucide-react';
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGameStore } from '../lib/store';

const WORLDS = [
  { id: 'couple_trip', title: 'Viagem em Casal', desc: 'Arraial do Cabo', icon: Tent, color: 'from-amber-400 to-orange-500' },
  { id: 'home', title: 'Em Casa', desc: 'Noite Especial', icon: Home, color: 'from-blue-400 to-indigo-500' },
  { id: 'family', title: 'Família', desc: 'Diversão em Família', icon: Users, color: 'from-emerald-400 to-teal-500' },
  { id: 'friends', title: 'Amigos', desc: 'Desafios e Risadas', icon: Sparkles, color: 'from-purple-400 to-fuchsia-500' },
  { id: 'corporate', title: 'Empresas', desc: 'Experiências', icon: Briefcase, color: 'from-slate-400 to-slate-500' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    }
  };

  const handleCreateRoom = async (worldId: string) => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const playerId = useGameStore.getState().playerId;
      await setDoc(doc(db, 'rooms', newRoomCode), {
        worldId,
        status: 'waiting',
        playerA: playerId,
        playerPosA: 0,
        playerPosB: 0,
        turn: 'A',
        diceValue: 1,
        isRolling: false,
        activeCard: null,
        updatedAt: Date.now()
      });
      navigate(`/room/${newRoomCode}?world=${worldId}`);
    } catch (error) {
      console.error("Error creating room: ", error);
      alert("Erro ao criar sala. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-auto md:overflow-hidden relative">
      {/* Abstract Background Particles (Simulated) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjZmZmIj48L2NpcmNsZT4KPC9zdmc+')] mix-blend-overlay"></div>

      {/* Left Panel: Branding & Worlds */}
      <div className="w-full md:w-2/3 p-6 md:p-12 flex flex-col justify-between z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-cursive text-6xl md:text-8xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Jornada</h1>
          <h2 className="text-xl md:text-2xl font-medium text-orange-400 tracking-wide uppercase mt-2">Jogos para casais com brindes</h2>
          <p className="text-slate-300 mt-4 max-w-lg text-lg leading-relaxed">
            Diversão, conexão e prêmios em cada jornada. Jogos criados para casais, famílias e amigos curtirem juntos, ganharem brindes e viverem momentos incríveis.
          </p>
        </motion.div>

        <div>
          <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" /> Mundos Disponíveis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {WORLDS.map((world, idx) => (
              <motion.button
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCreateRoom(world.id)}
                className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 group relative overflow-hidden h-40"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${world.color} transition-opacity duration-300`} />
                <div className={`p-3 rounded-full bg-gradient-to-br ${world.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <world.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">{world.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{world.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Join Room */}
      <div className="w-full md:w-1/3 bg-slate-900/50 backdrop-blur-xl border-l border-white/10 p-6 md:p-12 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-3xl p-8 w-full max-w-sm mx-auto flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Conectar Partner</h3>
          <p className="text-slate-400 text-sm mb-8">
            Escaneie o QR Code ou digite o código da sala para entrar em um jogo existente.
          </p>

          <form onSubmit={handleJoinRoom} className="w-full">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="A7B9-K2L4"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-4 text-center font-mono text-xl text-white tracking-widest uppercase focus:outline-none focus:border-orange-500 transition-colors mb-4 placeholder-slate-700"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={!roomCode.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 fill-current" /> Entrar na Sala
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
