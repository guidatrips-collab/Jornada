import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGameStore } from '../lib/store';

export default function RoomLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState<any>(null);
  const playerId = useGameStore(state => state.playerId);

  useEffect(() => {
    if (!id) return;

    // First check if room exists and join if needed
    const checkAndJoin = async () => {
      const roomRef = doc(db, 'rooms', id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const data = roomSnap.data();
        // If not player A, and player B is not set, join as player B
        if (data.playerA !== playerId && !data.playerB) {
          await updateDoc(roomRef, {
            playerB: playerId
          });
        }
      }
    };
    checkAndJoin();

    const unsub = onSnapshot(doc(db, 'rooms', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomData(data);
        if (data.status === 'playing') {
          navigate(`/game/${id}`);
        }
      }
    });

    return () => unsub();
  }, [id, playerId, navigate]);

  const handleStart = async () => {
    if (id) {
      await updateDoc(doc(db, 'rooms', id), {
        status: 'playing'
      });
    }
  };

  const isPlayerA = roomData?.playerA === playerId;
  const hasPlayerB = !!roomData?.playerB;
  const worldId = roomData?.worldId || 'couple_trip';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel rounded-3xl p-8 max-w-md w-full text-center relative z-10"
      >
        <h2 className="font-cursive text-4xl text-white mb-2">{isPlayerA ? 'Sala Criada!' : 'Entrando na Sala...'}</h2>
        <p className="text-slate-300 text-sm mb-8">
          Mundo: <span className="font-bold text-orange-400 capitalize">{worldId.replace('_', ' ')}</span>
        </p>

        {isPlayerA && !hasPlayerB && (
          <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-xl">
            <QRCodeSVG 
              value={`${window.location.origin}/room/${id}`} 
              size={200}
              fgColor="#0f172a"
            />
          </div>
        )}

        {isPlayerA && !hasPlayerB && (
           <>
             <p className="text-slate-400 text-sm mb-2">Ou compartilhe o código:</p>
             <div className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-3xl text-white tracking-widest uppercase mb-8">
               {id}
             </div>
           </>
        )}

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center font-bold text-lg shadow-lg mb-2 border-2 border-slate-900">
              A
            </div>
            <span className="text-xs text-slate-300">{isPlayerA ? 'Você' : 'Criador'}</span>
          </div>
          <div className="w-8 h-px bg-white/20"></div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${hasPlayerB ? 'bg-blue-500 text-white shadow-lg border-2 border-slate-900' : 'border-2 border-dashed border-white/30 text-white/50'} flex items-center justify-center font-bold mb-2`}>
              {hasPlayerB ? 'B' : '...'}
            </div>
            <span className="text-xs text-slate-400">{hasPlayerB ? (!isPlayerA ? 'Você' : 'Parceiro') : 'Aguardando'}</span>
          </div>
        </div>

        {isPlayerA && (
          <button
            onClick={handleStart}
            disabled={!hasPlayerB}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all"
          >
            {hasPlayerB ? 'Iniciar Partida' : 'Aguardando Parceiro...'}
          </button>
        )}
        {!isPlayerA && (
          <div className="text-slate-300 text-sm p-4 bg-white/5 rounded-xl border border-white/10">
            Aguardando o criador iniciar a partida...
          </div>
        )}
      </motion.div>
    </div>
  );
}
