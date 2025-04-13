import { useDrag } from 'react-dnd';
import { Rule } from '../types/types';

interface DraggableRuleProps {
  rule: Rule;
  isApplicable: boolean;
  onClick: () => void;
}

export function DraggableRule({ rule, isApplicable, onClick }: DraggableRuleProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'rule',
    item: rule,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isApplicable,
  }));

  const handleClick = () => {
    if (isApplicable) {
      onClick();
    }
  };

  const notApplicableMessage = isApplicable ? '' : 'Cannot add new rules while there are invalid rules in the chain';

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`rule-card ${isDragging ? 'dragging' : ''} ${isApplicable ? 'applicable' : 'not-applicable'}`}
      style={{ 
        opacity: isDragging ? 0.5 : isApplicable ? 1 : 0.5,
        cursor: isApplicable ? 'pointer' : 'not-allowed'
      }}
      role="button"
      tabIndex={isApplicable ? 0 : -1}
      aria-disabled={!isApplicable}
      title={notApplicableMessage}
    >
      <h3>{rule.name}</h3>
      <p>{rule.description}</p>
    </div>
  );
}