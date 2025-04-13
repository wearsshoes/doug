import { ReactNode } from 'react';
import { BidirectionalRule } from '../types/types';
import { useDrop } from 'react-dnd';

interface DroppableAreaProps {
  children: ReactNode;
  onDrop: (rule: BidirectionalRule) => void;
}

export function DroppableArea({ children, onDrop }: DroppableAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'rule',
    drop: (item: any) => {
      if (item && typeof item === 'object') {
        onDrop(item);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`applied-rules ${isOver ? 'dropping' : ''}`}>
      {children}
    </div>
  );
}