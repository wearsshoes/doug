import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Level, GameConfig, canApplyRule, BidirectionalRule, RuleApplication } from '../types/types';
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
  const [activeDirection, setActiveDirection] = useState<'forward' | 'backward'>('forward');

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

  const handleRuleSelect = (rule: BidirectionalRule, isDrop: boolean = false, dropDirection?: 'forward' | 'backward') => {
    const effectiveDirection = dropDirection || activeDirection;
    const effectiveChain = effectiveDirection === 'forward' ? bidirectionalChain.forward : bidirectionalChain.reverse;
    const ruleDirection = effectiveDirection === 'forward' ? rule.forward : rule.backward;

    if (effectiveChain.validUpTo < effectiveChain.rules.length) {
      console.log('Cannot add new rule: chain contains invalid rules');
      return;
    }

    const positions = ruleDirection.findApplications(effectiveChain.currentString);
    if (positions.length === 0) return;

    const hasMultiplePositions = positions.length > 1;

    setBidirectionalChain(currentBiChain => {
      const newBiChain = applyRuleToBidirectionalChain(
        currentBiChain,
        rule,
        0,
        effectiveDirection
      );

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
      setExpandedRuleIndex(effectiveChain.rules.length);
    }
  };

  const handleRuleDrop = (rule: BidirectionalRule, dropDirection: 'forward' | 'backward') => {
    handleRuleSelect(rule, true, dropDirection);
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

  const togglePositions = (index: number) => {
    const ruleApp = activeChain.rules[index];
    if (!ruleApp) return;

    const positions = ruleApp.rule[activeDirection].findApplications(activeChain.intermediateStrings[index]);
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
          <div>
            <p className="level-description">{currentLevel.description}</p>
          </div>

          <div className="chain-container">
            <div className="string-display initial">
              <div className="string-label">Initial String</div>
              <div className="string-value">{currentLevel.startString}</div>
            </div>

            <div className="forward-chain">
              <DroppableArea onDrop={(rule) => handleRuleDrop(rule, 'forward')}>
                <table className="transformation-table">
                  <thead>
                    <tr>
                      <th>Rule</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidirectionalChain.forward.rules.length === 0 ? (
                      <tr>
                        <td colSpan={2}>
                          <div className="empty-state">
                            Drag or click a rule
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bidirectionalChain.forward.rules.map((ruleApp, index) => {
                        const positions = ruleApp.rule[activeDirection].findApplications(bidirectionalChain.forward.intermediateStrings[index]);
                        const isExpanded = expandedRuleIndex === index && activeDirection === 'forward';
                        const hasMultiplePositions = positions && positions.length > 1;

                        return (
                          <tr key={`forward-${ruleApp.rule.id}-${index}`}>
                            <td>
                              <div className={`applied-rule ${index >= bidirectionalChain.forward.validUpTo ? 'invalid' : ''}`}>
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
                                    {positions.map((pos: RuleApplication, posIndex: number) => (
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
                              <span className="string-value">{bidirectionalChain.forward.intermediateStrings[index + 1]}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </DroppableArea>
            </div>

            <div className="reverse-chain">
              <DroppableArea onDrop={(rule) => handleRuleDrop(rule, 'backward')}>
                <table className="transformation-table">
                  <tbody>
                    {bidirectionalChain.reverse.rules.length === 0 ? (
                      <>
                        <tr>
                          <td colSpan={2}>
                            <div className="empty-state">
                              Drag or click a rule
                            </div>
                          </td>
                        </tr>
                        <tr className="table-footer">
                          <td>Rule</td>
                          <td className="reverse-result">Result</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        {[...bidirectionalChain.reverse.rules].reverse().map((ruleApp, reversedIndex) => {
                          const index = bidirectionalChain.reverse.rules.length - 1 - reversedIndex;
                          const positions = ruleApp.rule[activeDirection].findApplications(bidirectionalChain.reverse.intermediateStrings[index]);
                          const isExpanded = expandedRuleIndex === index && activeDirection === 'backward';
                          const hasMultiplePositions = positions && positions.length > 1;

                          return (
                            <tr key={`reverse-${ruleApp.rule.id}-${index}`}>
                              <td>
                                <div className={`applied-rule ${index >= bidirectionalChain.reverse.validUpTo ? 'invalid' : ''}`}>
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
                                      {positions.map((pos: RuleApplication, posIndex: number) => (
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
                              <td className="reverse-result">
                                <span className="string-value">
                                  {bidirectionalChain.reverse.intermediateStrings[index + 1]}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="table-footer">
                          <td>Rule</td>
                          <td className="reverse-result">Result</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </DroppableArea>
            </div>

            <div className="string-display target">
              <div className="string-label">Target String</div>
              <div className="string-value">{currentLevel.targetString}</div>
            </div>
          </div>
          <div>
          {bidirectionalChain.meetingPoint && (
              <div className="meeting-point">
                <span>Solution found! Common string: {bidirectionalChain.meetingPoint}</span>
                {currentLevelIndex < config.levels.length - 1 && (
                  <button onClick={nextLevel} className="next-level-button">
                    Next Level →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rules-panel">
          <div className="rules-header">
            <h2>Available Rules</h2>
            <div className="direction-toggle">
              <button
                className={activeDirection === 'forward' ? 'active' : ''}
                onClick={() => setActiveDirection('forward')}
              >
                Forward
              </button>
              <button
                className={activeDirection === 'backward' ? 'active' : ''}
                onClick={() => setActiveDirection('backward')}
              >
                Backward
              </button>
            </div>
            <p className="rules-hint">Green outline = rule can be applied (click or drag)</p>
          </div>
          <div className="rules-list">
            {config.rules.map(rule => (
              <DraggableRule
                key={rule.id}
                rule={rule}
                direction={activeDirection}
                isApplicable={
                  canAddNewRules && canApplyRule(
                    rule,
                    activeDirection,
                    activeDirection === 'forward'
                      ? bidirectionalChain.forward.currentString
                      : bidirectionalChain.reverse.currentString
                  )
                }
                onClick={() => handleRuleSelect(rule)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}