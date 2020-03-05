import * as React from 'react';
import useIterable, { onIterateFunction } from './useIterable';

interface PlayIterableProps {
  className?: string;
  iterables: any[];
  interval: number;
  onIterate: onIterateFunction;
  startIndex: number;
  renderIterable: (iterable: any) => React.ReactElement;
}

const PlayIterable: React.FunctionComponent<PlayIterableProps> = props => {
  const {
    className,
    iterables,
    renderIterable,
    interval,
    onIterate,
    startIndex,
  } = props;
  const { playing, handlePlay, handlePause } = useIterable({
    iterables,
    onIterate,
    interval,
    startIndex,
  });
  return (
    <ol className={`play-iterable ${className}`}>
      {/* TODO: Add Play button! */}
      {/* {playing ? (
        <button className="playing" onClick={handlePause}>
          Pause
        </button>
      ) : (
        <button onClick={handlePlay}>Play</button>
      )} */}
      {iterables.map(renderIterable)}
    </ol>
  );
};

export default PlayIterable;
