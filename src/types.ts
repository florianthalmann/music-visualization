export interface Margins {
  top: number,
  bottom: number,
  left: number,
  right: number
}

export interface ViewConfig {
  xAxis: ViewConfigDim,
  yAxis: ViewConfigDim,
  size: ViewConfigDim,
  width: ViewConfigDim,
  height?: ViewConfigDim, //if height not defined, it is determined by y-axis if necessary
  color: ViewConfigDim
}

export interface ViewConfigDim {
  name: string,
  param: Object,
  log: boolean,
  position?: Position
}

export interface JsonGraph {
  nodes: Object[],
  edges: JsonEdge[]
}

export interface JsonEdge {
  source: Object,
  target: Object,
  value: number
}

export interface D3Shape {
  name: string,
  x: string,
  y: string,
  width?: string,
  height?: string,
  size?: string
}

export let Circle: D3Shape = {name: "circle", x: "cx", y: "cy", size: "r"};
export let Ellipse: D3Shape = {name: "ellipse", x: "cx", y: "cy", width: "rx", height: "ry"};
export let Rectangle: D3Shape = {name: "rect", x: "x", y: "y", width: "width", height: "height"};

export interface SvgElement {
  x: number,
  y: number,
  fx: number,
  fy: number
}

export enum Position {
  Start, //beginning of the element is at the value, e.g. left or bottom
  Center, //centered around the value
  End //end of the element is at the value, e.g. right or top
}