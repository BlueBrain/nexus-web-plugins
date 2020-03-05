import * as React from 'react';

const DEFAULT_INTERVAL_MS = 1000;

export type onIterateFunction = (iterable: any) => void;

export interface UseIterableProps {
  iterables: any[];
  onIterate?: onIterateFunction;
  interval?: number;
  startIndex?: number;
}

// Iterate through a list, with play and stop playing functions
const useIterable = ({
  iterables,
  onIterate,
  interval,
  startIndex,
}: UseIterableProps) => {
  const [index, setIndex] = React.useState(startIndex || 0);
  const [playing, setPlaying] = React.useState(false);
  const timeout = React.useRef();

  const iterate = () => {
    let newIndex = index + 1;
    if (newIndex >= iterables.length) {
      newIndex = 0;
    }
    // @ts-ignore
    timeout.current = setTimeout(() => {
      setIndex(newIndex);
      setPlaying(true);
      handlePlay();
    }, interval || DEFAULT_INTERVAL_MS);
  };

  const handlePlay = () => {
    if (!playing) {
      iterate();
    }
  };
  const handlePause = () => {
    setPlaying(false);
  };

  React.useEffect(() => {
    playing && !!onIterate && onIterate(iterables[index]);
    if (!playing) {
      clearTimeout(timeout.current);
    }
  }, [index, playing]);

  return {
    index,
    playing,
    handlePlay,
    handlePause,
    current: iterables[index],
  };
};

export default useIterable;
