import { useDrag } from 'react-dnd';
import { BidirectionalRule } from '../types/types';

interface DraggableRuleProps {
  rule: BidirectionalRule;
  direction: 'forward' | 'backward';
  isApplicable: boolean;
  onClick: () => void;
}

export function DraggableRule({ rule, direction, isApplicable, onClick }: DraggableRuleProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'rule',
    item: {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      forward: rule.forward,
      backward: rule.backward
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const ruleDirection = direction === 'forward' ? rule.forward : rule.backward;

  return (
    <div
      ref={drag}
      className={`rule-card ${isApplicable ? 'applicable' : 'not-applicable'}`}
      onClick={isApplicable ? onClick : undefined}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <h3>{rule.name}</h3>
      <p>{ruleDirection.description}</p>
    </div>
  );
}