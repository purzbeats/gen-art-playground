import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItemCount = endIndex - startIndex + 1;
    const offsetY = startIndex * itemHeight;

    return {
      items: items.slice(startIndex, endIndex + 1),
      startIndex,
      offsetY,
      totalHeight: items.length * itemHeight,
      visibleItemCount
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // Intersection Observer for better performance
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    let ticking = false;
    const updateScrollTop = () => {
      setScrollTop(element.scrollTop);
      ticking = false;
    };

    const handleScrollOptimized = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollTop);
        ticking = true;
      }
    };

    element.addEventListener('scroll', handleScrollOptimized, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScrollOptimized);
    };
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleItems.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.items.map((item, index) => (
            <div
              key={visibleItems.startIndex + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Higher-order component for easier integration
export function withVirtualScrolling<T>(
  Component: React.ComponentType<{
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
  }>,
  itemHeight: number,
  containerHeight: number
) {
  return function VirtualizedComponent(props: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
  }) {
    if (props.items.length < 20) {
      // For small lists, don't virtualize
      return <Component {...props} />;
    }

    return (
      <VirtualScrollList
        items={props.items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={props.renderItem}
      />
    );
  };
}