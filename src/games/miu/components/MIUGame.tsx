import { AlgebraGame } from '../../../engine/components/AlgebraGame';
import { MIUConfig } from '../types/config';
import './MIUGame.css';

export function MIUGame() {
  return (
    <AlgebraGame
      config={MIUConfig}
      className="miu-game"
      gameName="MIU Game"
    />
  );
}