import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MIURules, Rule, MIULevels, Level, canApplyRule } from '../types/miu';
import { RuleChain, computeRuleChain, applyRuleToChain, deleteRuleFromChain } from '../types/ruleChain';
import { DraggableRule } from './DraggableRule';
import { DroppableArea } from './DroppableArea';
import './MIUGame.css';

export function MIUGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = MIULevels[currentLevelIndex];

  const getInitialChain = (level: Level): RuleChain =>
    computeRuleChain(level.startString, []);

  const [ruleChain, setRuleChain] = useState<RuleChain>(getInitialChain(currentLevel));

  const resetGame = () => {
    setRuleChain(getInitialChain(currentLevel));
  };

  const selectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    const level = MIULevels[index];
    setRuleChain(getInitialChain(level));
  };

  const nextLevel = () => {
    if (currentLevelIndex < MIULevels.length - 1) {
      selectLevel(currentLevelIndex + 1);
    }
  };

  const applyRule = (rule: Rule) => {
    const newChain = applyRuleToChain(ruleChain, rule);
    if (newChain.currentString !== ruleChain.currentString) {
      console.log('Rule applied:', {
        ruleName: rule.name,
        ruleId: rule.id,
        from: ruleChain.currentString,
        to: newChain.currentString,
        targetString: currentLevel.targetString,
        level: currentLevel.id
      });

      setRuleChain(newChain);
    } else {
      console.log('Rule not applicable:', {
        ruleName: rule.name,
        currentString: ruleChain.currentString,
        level: currentLevel.id
      });
    }
  };

  const deleteRule = (index: number) => {
    setRuleChain(deleteRuleFromChain(ruleChain, index));
  };

  const isComplete = ruleChain.currentString === currentLevel.targetString;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="miu-game">
        <div className="game-status-panel">
          <h1>MIU Game</h1>
          <div className="level-selector">
            <h2>Select Level</h2>
            <div className="level-buttons">
              {MIULevels.map((level, index) => (
                <button
                  key={level.id}
                  onClick={() => selectLevel(index)}
                  className={`level-button ${index === currentLevelIndex ? 'active' : ''}`}
                >
                  Level {index + 1}
                  <span className="difficulty">{level.difficulty}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <button onClick={resetGame} className="reset-button">
              Reset Level
            </button>
          </div>
        </div>

        <div className="main-content">
          <div>
            <p className="level-description">{currentLevel.description}</p>
          </div>
          <div className="string-display">
            <div className="initial-string">
              <span className="string-value">{ruleChain.intermediateStrings[0]}</span>
            </div>
          </div>

          <div className="game-workspace">
            <DroppableArea onDrop={applyRule}>
              <table className="transformation-table">
                <thead>
                  <tr>
                    <th>Applied Rule</th>
                    <th>Resulting String</th>
                  </tr>
                </thead>
                <tbody>
                  {ruleChain.rules.length === 0 ? (
                    <tr>
                      <td colSpan={2}>
                        <div className="empty-state">
                          Drag a rule here or click an applicable rule to start transforming the string
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ruleChain.rules.map((rule, index) => (
                      <tr key={`${rule.id}-${index}`}>
                        <td>
                          <div className={`applied-rule ${index >= ruleChain.validUpTo ? 'invalid' : ''}`}>
                            <span>{rule.name}</span>
                            <button
                              onClick={() => deleteRule(index)}
                              className="delete-rule"
                              title="Delete this rule and revalidate sequence"
                              aria-label={`Delete ${rule.name}`}
                            >
                              ×
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="string-value">{ruleChain.intermediateStrings[index + 1]}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DroppableArea>

            <div className="target-string-display">
              <div className="target-string">
                <span className="string-value">{currentLevel.targetString}</span>
              </div>
            </div>

            {isComplete && (
              <div className="win-message">
                <p>Congratulations! You've completed this level!</p>
                {currentLevelIndex < MIULevels.length - 1 && (
                  <button onClick={nextLevel} className="next-level-button">
                    Next Level
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rules-panel">
          <div className="rules-header">
            <h2>Available Rules</h2>
            <p className="rules-hint">Green outline = rule can be applied (click or drag)</p>
          </div>
          <div className="rules-list">
            {MIURules.map(rule => (
              <DraggableRule
                key={rule.id}
                rule={rule}
                isApplicable={canApplyRule(rule, ruleChain.currentString)}
                onClick={() => applyRule(rule)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}