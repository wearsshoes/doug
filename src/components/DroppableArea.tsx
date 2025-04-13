import { useDrop } from 'react-dnd';
import { Rule } from '../types/miu';

interface DroppableAreaProps {
  onDrop: (rule: Rule) => void;
  children: React.ReactNode;
}

export function DroppableArea({ onDrop, children }: DroppableAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'rule',
    drop: (item: Rule) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`applied-rules ${isOver ? 'dropping' : ''}`}
      role="region"
      aria-label="Drop zone for rules"
    >
      {children}
    </div>
  );
}