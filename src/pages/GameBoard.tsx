import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Dices, Gift, HelpCircle, AlertTriangle, Zap, Map } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGameStore } from '../lib/store';

const SPACES = Array.from({ length: 15 }).map((_, i) => {
  const types = ['quiz', 'challenge', 'luck', 'reward', 'mystery', 'neutral'];
  const type = i === 0 ? 'start' : i === 14 ? 'end' : types[Math.floor(Math.random() * types.length)];
  return { id: i, type };
});

export default function GameBoard() {
  const { id } = useParams();
  const playerId = useGameStore(state => state.playerId);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'rooms', id), (doc) => {
      if (doc.exists()) {
        setRoomData(doc.data());
      }
    });
    return () => unsub();
  }, [id]);

  const isPlayerA = roomData?.playerA === playerId;
  const isMyTurn = (roomData?.turn === 'A' && isPlayerA) || (roomData?.turn === 'B' && !isPlayerA);
  
  const myPos = isPlayerA ? roomData?.playerPosA : roomData?.playerPosB;
  const partnerPos = isPlayerA ? roomData?.playerPosB : roomData?.playerPosA;
  
  const diceValue = roomData?.diceValue || 1;
  const isRolling = roomData?.isRolling || false;
  const activeCard = roomData?.activeCard || null;

  const rollDice = async () => {
    if (isRolling || !isMyTurn || !id) return;
    
    await updateDoc(doc(db, 'rooms', id), { isRolling: true });
    
    let rolls = 0;
    const interval = setInterval(async () => {
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 3) + 1; // 1 to 3 steps
        const newPos = Math.min((myPos || 0) + finalValue, SPACES.length - 1);
        
        const updates: any = {
          diceValue: finalValue,
          isRolling: false,
        };
        
        if (isPlayerA) updates.playerPosA = newPos;
        else updates.playerPosB = newPos;
        
        if (newPos > 0 && newPos < SPACES.length - 1) {
           updates.activeCard = SPACES[newPos];
        } else {
           updates.turn = isPlayerA ? 'B' : 'A';
        }

        await updateDoc(doc(db, 'rooms', id), updates);
      }
    }, 100);
  };

  const closeCard = async () => {
    if (!id) return;
    await updateDoc(doc(db, 'rooms', id), {
      activeCard: null,
      turn: isPlayerA ? 'B' : 'A'
    });
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'from-purple-500 to-fuchsia-600';
      case 'challenge': return 'from-orange-500 to-rose-600';
      case 'luck': return 'from-emerald-400 to-teal-500';
      case 'reward': return 'from-amber-400 to-yellow-500';
      case 'mystery': return 'from-blue-500 to-indigo-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'quiz': return HelpCircle;
      case 'challenge': return Zap;
      case 'luck': return AlertTriangle;
      case 'reward': return Gift;
      case 'mystery': return Map;
      default: return Map;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      </div>
      
      <header className="glass-panel w-full p-4 flex justify-between items-center z-20 sticky top-0 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <h1 className="font-cursive text-3xl text-white">Jornada</h1>
          <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-white/70">
            SALA: {id}
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <div className="flex -space-x-2">
             <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-slate-900 flex items-center justify-center font-bold shadow-lg z-10">A</div>
             <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center font-bold shadow-lg">B</div>
           </div>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-8 z-10">
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
           <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-30">
              <path d="M 100,200 C 300,50 600,350 900,200" fill="none" stroke="white" strokeWidth="4" strokeDasharray="10 10" />
           </svg>

           <div className="flex flex-wrap justify-center gap-4 relative z-10 max-w-3xl">
              {SPACES.map((space, idx) => {
                const Icon = getCardIcon(space.type);
                const isCurrent = myPos === idx;
                const isPartnerAt = partnerPos === idx;
                
                return (
                  <motion.div 
                    key={space.id}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 
                      ${space.type === 'start' ? 'bg-emerald-500/20 border-emerald-500/50' : 
                        space.type === 'end' ? 'bg-amber-500/20 border-amber-500/50' : 
                        'glass-card'}`}
                  >
                     {space.type !== 'start' && space.type !== 'end' && space.type !== 'neutral' && (
                       <Icon className="w-6 h-6 text-white/50" />
                     )}
                     {space.type === 'start' && <span className="text-xs font-bold text-emerald-400">INÍCIO</span>}
                     {space.type === 'end' && <span className="text-xs font-bold text-amber-400">FIM</span>}
                     
                     <AnimatePresence>
                       {isCurrent && (
                         <motion.div 
                           key="player-token"
                           layoutId="player-token"
                           className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${isPlayerA ? 'from-orange-400 to-rose-500' : 'from-blue-400 to-indigo-500'} shadow-[0_0_15px_rgba(249,115,22,0.6)] border-2 border-white flex items-center justify-center z-20`}
                         >
                           <span className="text-xs font-bold text-white">{isPlayerA ? 'A' : 'B'}</span>
                         </motion.div>
                       )}
                       {isPartnerAt && (
                         <motion.div 
                           key="partner-token"
                           layoutId="partner-token"
                           className={`absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${isPlayerA ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-rose-500'} shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-white flex items-center justify-center z-10`}
                         >
                           <span className="text-xs font-bold text-white">{isPlayerA ? 'B' : 'A'}</span>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </motion.div>
                )
              })}
           </div>
        </div>
      </main>

      <footer className="p-8 flex justify-center z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={rollDice}
          disabled={!isMyTurn || isRolling || activeCard !== null}
          className="glass-panel relative group rounded-3xl p-4 pr-8 flex items-center gap-6 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 bg-white rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center transform rotate-12 group-hover:rotate-180 transition-transform duration-700">
             {isRolling ? (
               <Dices className="w-8 h-8 text-slate-800 animate-spin" />
             ) : (
               <span className="text-3xl font-black text-slate-800">{diceValue}</span>
             )}
          </div>
          <div className="text-left relative z-10">
            <h3 className="font-display font-bold text-xl text-white">Girar Dado</h3>
            <p className="text-orange-400 text-sm">{isMyTurn ? 'É a sua vez!' : 'Aguarde o parceiro...'}</p>
          </div>
        </motion.button>
      </footer>

      <AnimatePresence>
        {activeCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, rotateY: -90 }}
              animate={{ scale: 1, y: 0, rotateY: 0 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className={`w-full max-w-sm rounded-3xl p-1 shadow-2xl bg-gradient-to-br ${getCardColor(activeCard.type)}`}
            >
              <div className="bg-slate-900 rounded-[22px] p-8 h-96 flex flex-col items-center text-center relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${getCardColor(activeCard.type)}`} />
                
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getCardColor(activeCard.type)} flex items-center justify-center mb-6 shadow-lg`}>
                  {(() => {
                    const Icon = getCardIcon(activeCard.type);
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                
                <h2 className="font-display text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                  {activeCard.type}
                </h2>
                
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {activeCard.type === 'quiz' && 'Qual é a comida favorita do seu parceiro(a)? Vote em segredo!'}
                    {activeCard.type === 'challenge' && 'Façam uma massagem relaxante de 1 minuto no seu amor.'}
                    {activeCard.type === 'reward' && 'Vocês ganharam um drink grátis no bar! Resgate nos seus brindes.'}
                    {activeCard.type === 'luck' && 'O barco adiantou, avance 2 casas!'}
                    {activeCard.type === 'mystery' && 'Um evento misterioso aconteceu...'}
                  </p>
                </div>

                {isMyTurn && (
                  <button 
                    onClick={closeCard}
                    className="mt-6 w-full py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Continuar
                  </button>
                )}
                {!isMyTurn && (
                  <div className="mt-6 text-slate-400 text-sm">
                    Aguardando o parceiro...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
