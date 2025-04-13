import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Rule, Level, GameConfig, canApplyRule } from '../types/types';
import { RuleChain, computeRuleChain, applyRuleToChain, deleteRuleFromChain } from '../types/ruleChain';
import { DraggableRule } from './DraggableRule';
import { DroppableArea } from './DroppableArea';
import './AlgebraGame.css';

interface AlgebraGameProps {
  config: GameConfig;
  className?: string;
  gameName: string;
}

export function AlgebraGame({ config, className = '', gameName }: AlgebraGameProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = config.levels[currentLevelIndex];
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(null);

  const getInitialChain = (level: Level): RuleChain =>
    computeRuleChain(level.startString, []);

  const [ruleChain, setRuleChain] = useState<RuleChain>(getInitialChain(currentLevel));

  const resetGame = () => {
    setRuleChain(getInitialChain(currentLevel));
  };

  const selectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    const level = config.levels[index];
    setRuleChain(getInitialChain(level));
  };

  const nextLevel = () => {
    if (currentLevelIndex < config.levels.length - 1) {
      selectLevel(currentLevelIndex + 1);
    }
  };

  const handleRuleSelect = (rule: Rule, isDrop: boolean = false) => {
    if (ruleChain.validUpTo < ruleChain.rules.length) {
      console.log('Cannot add new rule: chain contains invalid rules');
      return;
    }

    const positions = rule.findApplications(ruleChain.currentString);
    if (positions.length === 0) return;
    
    const hasMultiplePositions = positions.length > 1;
    
    setRuleChain(currentChain => {
      const newChain = applyRuleToChain(currentChain, rule, 0);
      console.log('Rule applied:', {
        ruleName: rule.name,
        ruleId: rule.id,
        position: 0,
        from: currentChain.currentString,
        to: newChain.currentString,
        targetString: currentLevel.targetString,
        level: currentLevel.id
      });
      return newChain;
    });

    if (!isDrop && hasMultiplePositions) {
      setExpandedRuleIndex(ruleChain.rules.length);
    }
  };

  const handleRuleDrop = (rule: Rule) => {
    handleRuleSelect(rule, true);
  };

  const deleteRule = (index: number) => {
    if (expandedRuleIndex === index) {
      setExpandedRuleIndex(null);
    }
    else if (expandedRuleIndex !== null && index < expandedRuleIndex) {
      setExpandedRuleIndex(expandedRuleIndex - 1);
    }
    
    setRuleChain(currentChain => deleteRuleFromChain(currentChain, index));
  };

  const isComplete = ruleChain.currentString === currentLevel.targetString;

  const togglePositions = (index: number) => {
    const ruleApp = ruleChain.rules[index];
    const positions = ruleApp.rule.findApplications(ruleChain.intermediateStrings[index]);
    if (positions.length <= 1) return;

    setExpandedRuleIndex(expandedRuleIndex === index ? null : index);
  };

  const changePosition = (ruleIndex: number, newPosition: number) => {
    const newRules = [...ruleChain.rules];
    newRules[ruleIndex] = { ...newRules[ruleIndex], position: newPosition };
    setRuleChain(computeRuleChain(ruleChain.intermediateStrings[0], newRules));
    setExpandedRuleIndex(null);
  };

  const canAddNewRules = ruleChain.validUpTo >= ruleChain.rules.length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`algebra-game ${className}`}>
        <div className="game-status-panel">
          <h1>{gameName}</h1>
          <div className="level-selector">
            <h2>Select Level</h2>
            <div className="level-buttons">
              {config.levels.map((level, index) => (
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
            <DroppableArea onDrop={handleRuleDrop}>
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
                    ruleChain.rules.map((ruleApp, index) => {
                      const positions = ruleApp.rule.findApplications(ruleChain.intermediateStrings[index]);
                      const isExpanded = expandedRuleIndex === index;
                      const hasMultiplePositions = positions.length > 1;

                      return (
                        <tr key={`${ruleApp.rule.id}-${index}`}>
                          <td>
                            <div className={`applied-rule ${index >= ruleChain.validUpTo ? 'invalid' : ''}`}>
                              <div className="applied-rule-header">
                                <span>{ruleApp.rule.name}</span>
                                {hasMultiplePositions && (
                                  <button
                                    onClick={() => togglePositions(index)}
                                    className="toggle-positions"
                                  >
                                    {isExpanded ? 'Hide positions' : 'Show positions'}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteRule(index)}
                                  className="delete-rule"
                                  title="Delete this rule and revalidate sequence"
                                  aria-label={`Delete ${ruleApp.rule.name}`}
                                >
                                  ×
                                </button>
                              </div>
                              {isExpanded && (
                                <div className="position-options-inline">
                                  {positions.map((pos, posIndex) => (
                                    <div
                                      key={posIndex}
                                      className={`position-option-inline ${posIndex === ruleApp.position ? 'selected' : ''}`}
                                      onClick={() => changePosition(index, posIndex)}
                                    >
                                      <div className="preview-string-inline">
                                        <span>{pos.preview.slice(0, pos.startIndex)}</span>
                                        <span className="highlight">{pos.preview.slice(pos.startIndex, pos.endIndex)}</span>
                                        <span>{pos.preview.slice(pos.endIndex)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="string-value">{ruleChain.intermediateStrings[index + 1]}</span>
                          </td>
                        </tr>
                      );
                    })
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
                {currentLevelIndex < config.levels.length - 1 && (
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
            {config.rules.map(rule => (
              <DraggableRule
                key={rule.id}
                rule={rule}
                isApplicable={canAddNewRules && canApplyRule(rule, ruleChain.currentString)}
                onClick={() => handleRuleSelect(rule)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}