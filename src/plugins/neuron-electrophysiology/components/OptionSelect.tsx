import { Select } from "antd"
import React, { FC } from "react"

interface OptionSelect {
    label: {
        title: string;
        numberOfAvailable: number
    },
    value: string;
    handleChange: (value: string) => void;
    options: JSX.Element[] | null;
    hideWhenSingle?: boolean;
}

const OptionSelect: FC<OptionSelect> = ({label: {numberOfAvailable, title}, value, handleChange, options, hideWhenSingle = false}) => {
  if(hideWhenSingle && numberOfAvailable === 1) {
    return null;
  }
  return (
    <div className="option-select">
      <label>
        <b>{title}</b>{numberOfAvailable > 1 && <>&nbsp;({numberOfAvailable} available)</>}
      </label>
      {numberOfAvailable > 1
        ? <Select
            className="w-100"
            value={value}
            placeholder="Please select"
            onChange={handleChange}
          >
            {options}
          </Select>
        : <>:&nbsp;{value}</>
      }
    </div>
  )
}

export { OptionSelect };
