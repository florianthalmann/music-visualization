import * as d3f from 'd3-force';
import { drag } from 'd3-drag';
import { event } from 'd3-selection';
import { MusicVisualization } from './music-visualization';
import { Circle, Rectangle, SvgElement } from './types';

export class Graph extends MusicVisualization {

  private simulation;

  constructor(element, onClick) {
    super(element, {top: 0, bottom: 0, left: 0, right: 0}, false, true, false, onClick);
    this.simulation = d3f.forceSimulation()
      //.velocityDecay(1)
      .force("x", d3f.forceX())
      .force("y", d3f.forceY())
      .force("link", d3f.forceLink().distance(50))//.strength(1))
      .force("charge", d3f.forceManyBody().strength(-70))
  }

  updateDataRepresentation() {
    this.addNodeShapes(Circle);
    this.addEdgeLines();
    this.addDragging();
    this.simulation
      .force("center", d3f.forceCenter(this.width/2, this.height/2))
      .nodes(this.data.nodes)
      .on("tick", () => {
        this.updateShapePositions();
        this.updateLinePositions();
      })
      .force("link").links(this.data.edges);
  }

  private addDragging() {
    this.getNodeShapes()
      .call(drag()
        .on("start", (d: SvgElement) => {
          if (!event.active) this.simulation.alphaTarget(1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (d: SvgElement) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (d: SvgElement) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );
  }

}
