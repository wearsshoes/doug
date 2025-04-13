import { AlgebraGame } from '../../engine/components/AlgebraGame';
import { Levels } from './levels';
import { Rules } from './rules';

export function Game() {
  return (
    <AlgebraGame
      config={{
        rules: Rules,
        levels: Levels
      }}
      className="miu-game"
      gameName="MIU Game"
    />
  );
}