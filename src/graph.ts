import * as d3 from 'd3';
import { MusicVisualization } from './music-visualization';
import { Circle, Rectangle, SvgElement } from './types';

export class Graph extends MusicVisualization {

  private simulation;

  constructor(element, onClick) {
    super(element, {top: 0, bottom: 0, left: 0, right: 0}, false, true, false, onClick);
    this.simulation = d3.forceSimulation()
      //.velocityDecay(1)
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("link", d3.forceLink().distance(50))//.strength(1))
      .force("charge", d3.forceManyBody().strength(-70))
  }

  updateDataRepresentation() {
    this.addNodeShapes(Circle);
    this.addEdgeLines();
    this.addDragging();
    this.simulation
      .force("center", d3.forceCenter(this.width/2, this.height/2))
      .nodes(this.data.nodes)
      .on("tick", () => {
        this.updateShapePositions();
        this.updateLinePositions();
      })
      .force("link").links(this.data.edges);
  }

  private addDragging() {
    this.getNodeShapes()
      .call(d3.drag()
        .on("start", (d: SvgElement) => {
          if (!d3.event.active) this.simulation.alphaTarget(1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (d: SvgElement) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on("end", (d: SvgElement) => {
          if (!d3.event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );
  }

}
