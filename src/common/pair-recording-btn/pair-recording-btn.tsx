import * as React from "react";
import qs from "query-string";
import { Button } from "antd";

import "./pair-recording-btn.css";

const pairRecordingAppBaseUrl = "http://bp.ocp.bbp.epfl.ch";

export interface PairRecordingBtnProps {
  name: string;
  configPath: string;
  className?: string;
}

export const PairRecordingBtn = (props: PairRecordingBtnProps) => {
  const params = {
    name: props.name,
    path: props.configPath
  };
  const query = qs.stringify(params);
  const href = `${pairRecordingAppBaseUrl}/circuits/?${query}`;

  return (
    <Button className={props.className} href={href} target="_blank">
      Open in Pair Recording App
    </Button>
  );
};

export default PairRecordingBtn;
