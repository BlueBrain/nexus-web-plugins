import * as React from 'react';
import type { PickerTimeProps } from 'antd/es/date-picker/generatePicker';
import type { Moment } from 'moment';
import { DatePicker } from 'antd';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';

const MyDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);

export interface TimePickerProps extends Omit<PickerTimeProps<Moment>, 'picker'> {}

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  <MyDatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export default TimePicker;