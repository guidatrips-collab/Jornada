/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import RoomLobby from './pages/RoomLobby';
import GameBoard from './pages/GameBoard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:id" element={<RoomLobby />} />
        <Route path="/game/:id" element={<GameBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

