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
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(null);

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

  const handleRuleSelect = (rule: Rule) => {
    const positions = rule.findApplications(ruleChain.currentString);
    if (positions.length === 0) return;
    
    if (positions.length === 1) {
      applyRuleAtPosition(rule, 0);
    } else {
      applyRuleAtPosition(rule, 0);
      setExpandedRuleIndex(ruleChain.rules.length);
    }
  };

  const applyRuleAtPosition = (rule: Rule, position: number) => {
    const newChain = applyRuleToChain(ruleChain, rule, position);
    console.log('Rule applied:', {
      ruleName: rule.name,
      ruleId: rule.id,
      position,
      from: ruleChain.currentString,
      to: newChain.currentString,
      targetString: currentLevel.targetString,
      level: currentLevel.id
    });

    setRuleChain(newChain);
  };

  const deleteRule = (index: number) => {
    setRuleChain(deleteRuleFromChain(ruleChain, index));
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
            <DroppableArea onDrop={handleRuleSelect}>
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
                onClick={() => handleRuleSelect(rule)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}