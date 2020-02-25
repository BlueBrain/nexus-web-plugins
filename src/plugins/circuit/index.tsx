
import * as React from "react";
import ReactDOM from "react-dom";

import { NexusPluginProps } from "../../common/types";

import { DetailedCircuitResource } from "./types";
import Circuit from "./circuit";


export { Circuit };

export default ({ ref, resource, nexusClient }: NexusPluginProps<DetailedCircuitResource>) => {
  ReactDOM.render(<Circuit resource={resource} nexus={nexusClient}/>, ref);
  return () => ReactDOM.unmountComponentAtNode(ref);
};
