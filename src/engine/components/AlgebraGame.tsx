import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Rule, Level, GameConfig, canApplyRule } from '../types/types';
import { RuleChain, computeRuleChain, applyRuleToChain, deleteRuleFromChain } from '../types/ruleChain';
import { BidirectionalChain, computeBidirectionalChain, applyRuleToBidirectionalChain, deleteRuleFromBidirectionalChain } from '../types/ruleChain';
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
  const [activeDirection, setActiveDirection] = useState<'forward' | 'reverse'>('forward');

  const getInitialChain = (level: Level): BidirectionalChain =>
    computeBidirectionalChain(level.startString, level.targetString, [], []);

  const [bidirectionalChain, setBidirectionalChain] = useState<BidirectionalChain>(getInitialChain(currentLevel));

  const activeChain = activeDirection === 'forward' ? bidirectionalChain.forward : bidirectionalChain.reverse;

  const resetGame = () => {
    setBidirectionalChain(getInitialChain(currentLevel));
    setActiveDirection('forward');
    setExpandedRuleIndex(null);
  };

  const selectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    const level = config.levels[index];
    setBidirectionalChain(getInitialChain(level));
    setActiveDirection('forward');
    setExpandedRuleIndex(null);
  };

  const nextLevel = () => {
    if (currentLevelIndex < config.levels.length - 1) {
      selectLevel(currentLevelIndex + 1);
    }
  };

  const handleRuleSelect = (rule: Rule, isDrop: boolean = false) => {
    if (activeChain.validUpTo < activeChain.rules.length) {
      console.log('Cannot add new rule: chain contains invalid rules');
      return;
    }

    const positions = rule.findApplications(activeChain.currentString);
    if (positions.length === 0) return;
    
    const hasMultiplePositions = positions.length > 1;
    
    setBidirectionalChain(currentBiChain => {
      const newBiChain = applyRuleToBidirectionalChain(currentBiChain, rule, 0, activeDirection);
      const forward = newBiChain.forward;
      const reverse = newBiChain.reverse;
      let meetingPoint: string | null = null;
      
      for (const fStr of forward.intermediateStrings) {
        for (const rStr of reverse.intermediateStrings) {
          if (fStr === rStr) {
            meetingPoint = fStr;
            break;
          }
        }
        if (meetingPoint) break;
      }

      return { ...newBiChain, meetingPoint };
    });

    if (!isDrop && hasMultiplePositions) {
      setExpandedRuleIndex(activeChain.rules.length);
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
    
    setBidirectionalChain(currentBiChain => 
      deleteRuleFromBidirectionalChain(currentBiChain, index, activeDirection)
    );
  };

  const isComplete = Boolean(bidirectionalChain.meetingPoint);

  const togglePositions = (index: number) => {
    const ruleApp = activeChain.rules[index];
    if (!ruleApp) return;
    
    const positions = ruleApp.rule.findApplications(activeChain.intermediateStrings[index]);
    if (!positions || positions.length <= 1) return;

    setExpandedRuleIndex(expandedRuleIndex === index ? null : index);
  };

  const changePosition = (ruleIndex: number, newPosition: number) => {
    setBidirectionalChain(currentBiChain => {
      if (activeDirection === 'forward') {
        const newRules = [...currentBiChain.forward.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], position: newPosition };
        return computeBidirectionalChain(
          currentLevel.startString,
          currentLevel.targetString,
          newRules,
          currentBiChain.reverse.rules
        );
      } else {
        const newRules = [...currentBiChain.reverse.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], position: newPosition };
        return computeBidirectionalChain(
          currentLevel.startString,
          currentLevel.targetString,
          currentBiChain.forward.rules,
          newRules
        );
      }
    });
    setExpandedRuleIndex(null);
  };

  const canAddNewRules = activeChain.validUpTo >= activeChain.rules.length;

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
          <div className="direction-toggle">
            <button
              onClick={() => setActiveDirection('forward')}
              className={activeDirection === 'forward' ? 'active' : ''}
            >
              Forward (Start → Target)
            </button>
            <button
              onClick={() => setActiveDirection('reverse')}
              className={activeDirection === 'reverse' ? 'active' : ''}
            >
              Reverse (Target → Start)
            </button>
          </div>

          <div>
            <p className="level-description">{currentLevel.description}</p>
          </div>

          <div className="string-display">
            <div className="initial-string">
              <span className="string-value">
                {activeDirection === 'forward' ? 
                  bidirectionalChain.forward.intermediateStrings[0] :
                  bidirectionalChain.reverse.intermediateStrings[0]}
              </span>
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
                  {activeChain.rules.length === 0 ? (
                    <tr>
                      <td colSpan={2}>
                        <div className="empty-state">
                          Drag a rule here or click an applicable rule to start transforming the string
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activeChain.rules.map((ruleApp, index) => {
                      const positions = ruleApp.rule.findApplications(activeChain.intermediateStrings[index]);
                      const isExpanded = expandedRuleIndex === index;
                      const hasMultiplePositions = positions && positions.length > 1;

                      return (
                        <tr key={`${ruleApp.rule.id}-${index}`}>
                          <td>
                            <div className={`applied-rule ${index >= activeChain.validUpTo ? 'invalid' : ''}`}>
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
                              {isExpanded && positions && (
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
                            <span className="string-value">{activeChain.intermediateStrings[index + 1]}</span>
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
                <span className="string-value">
                  {activeDirection === 'forward' ? 
                    currentLevel.targetString :
                    currentLevel.startString}
                </span>
              </div>
            </div>

            {bidirectionalChain.meetingPoint && (
              <div className="win-message">
                <p>Congratulations! The chains meet at: {bidirectionalChain.meetingPoint}</p>
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
            {config.rules
              .filter(rule => 
                rule.direction === 'both' || 
                rule.direction === activeDirection
              )
              .map(rule => (
                <DraggableRule
                  key={rule.id}
                  rule={rule}
                  isApplicable={canAddNewRules && canApplyRule(rule, activeChain.currentString)}
                  onClick={() => handleRuleSelect(rule)}
                />
              ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}