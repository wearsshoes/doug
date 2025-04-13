import { AlgebraGame } from '../../engine/components/AlgebraGame';
import { Config } from './config';

export function Game() {
  return (
    <AlgebraGame
      config={Config}
      className="miu-game"
      gameName="MIU Game"
    />
  );
}