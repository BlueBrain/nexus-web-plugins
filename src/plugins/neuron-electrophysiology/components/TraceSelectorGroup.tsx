import React, { FC } from 'react';


type TraceSelectorGroupProps = {
  selectedSweeps: string[];
  sweepsOptions: {label: string, value: string}[];
  handlePreviewSweep: (value?: string) => void;
  setSelectedSweeps: (sweeps: string[]) => void;
  colorMapper: {[key: string]: string};
  previewItem?: string;
}

const TraceSelectorGroup: FC<TraceSelectorGroupProps> = ({
  previewItem,
  selectedSweeps,
  sweepsOptions,
  handlePreviewSweep,
  colorMapper,
  setSelectedSweeps
}) => {
  const handleChange = ({target: {value, checked}}: any) => {
    if(checked) {
      setSelectedSweeps([...selectedSweeps, value]);
    }
    else {
      setSelectedSweeps(selectedSweeps.filter(sweep => sweep!==value));
    }
    handlePreviewSweep(undefined);
  };

  return (
    <>
      {sweepsOptions.map((sweep, index) => {
        const isSelected = selectedSweeps.includes(sweep.value);
        const isEmptySelection = !selectedSweeps.length;
        const isHighlight = isSelected || (isEmptySelection && !previewItem);

        return (
          <label
            key={sweep.label}
            onMouseEnter={() => { handlePreviewSweep(sweep.value) }}
            onMouseLeave={() => handlePreviewSweep(undefined)}
            className="ant-checkbox-wrapper trace-selector-group"
          >
            <span className="ant-checkbox">
              <input
                className="ant-checkbox-input"
                checked={isSelected}
                type="checkbox"
                value={sweep.label}
                onChange={handleChange}
              />
              <span
                className="ant-checkbox-inner"
                style={{
                  background: (colorMapper[sweep.value] || '#1890ff'),
                  borderColor: isSelected ? '#1890ff' : '#1890ff00',
                }}
              >
                <span
                  className="trace-selector-cover"
                  style={{display: isHighlight ? 'none': undefined}}
                />
              </span>
            </span>
          </label>
        );
      })}
    </>
  )
};

export { TraceSelectorGroup };
