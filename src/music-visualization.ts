import * as d3 from 'd3-shape';
import * as d3s from 'd3-selection';
import * as d3c from 'd3-scale';
import * as d3a from 'd3-axis';
import { Margins, ViewConfig, ViewConfigDim, JsonGraph, JsonEdge, D3Shape, Circle, Rectangle, Ellipse, Position } from './types';

let NODE_SHAPE = "nodeshape";
let NODE_LABEL = "nodelabel";
let EDGE_LINE = "edgeline";

interface GraphEdge {
  source,
  target
}

export abstract class MusicVisualization {

  protected svg;
  protected data: JsonGraph;
  private margins: Margins;
  private xAxis;
  private yAxis;
  private xScale;
  private yScale;
  private widthScale;
  private heightScale;
  private sizeScale;
  private colorScale;
  protected width;
  protected height;
  private viewconfig: ViewConfig;
  private prevRandomValues = {};
  private playingUris = [];
  private transitionDuration = 500;

  private shapeType: D3Shape;

  constructor(private element, margins, private showAxes, private highlightInEdges, private noY, private onClick) {
    this.margins = margins ? margins : { top: 0, bottom: 0, left: 0, right: 0};
    this.updateWidthAndHeight();
    this.svg = d3s.select(this.element).append('svg')
      .attr('width', this.element.offsetWidth)
      .attr('height', this.element.offsetHeight);
  }

  updateWidthAndHeight() {
    if (this.element) {
      this.width = this.element.offsetWidth - this.margins.left - this.margins.right;
      this.height = this.element.offsetHeight - this.margins.top - this.margins.bottom;
    }
  }

  getSvg() {
    return this.svg;
  }

  getDimension() {
    return [this.width, this.height]
  }

  updateData(data) {
    this.data = data;
    this.updateDataRepresentation();
  }

  protected abstract updateDataRepresentation();

  updateSize() {
    this.updateWidthAndHeight();
    this.svg.attr('width', this.element.offsetWidth);
    if (this.xScale) {
      this.updateScaleRanges();
      this.updateAxes();
    }
    this.updateDataRepresentation();
  }

  updateViewConfig(viewConfig: ViewConfig) {
    this.viewconfig = viewConfig;
    if (!this.xScale) {
      this.createScales();
      this.updateScaleRanges();
    }
    this.updateScaleDomains();
    this.updateAxes();
  }

  protected getNodeShapes() {
    return this.getDataSelection(this.data.nodes, NODE_SHAPE);
  }

  protected getEdgeLines() {
    return this.getDataSelection(this.data.edges, EDGE_LINE);
  }

  protected getDataSelection(data: Object[], objectClass: string) {
    return this.svg.selectAll("." + objectClass).data(data);
  }

  addNodeShapes(shapeType: D3Shape) {
    this.shapeType = shapeType;

    let dataSelection = this.getNodeShapes();

    let enters = dataSelection.enter()
      .append(this.shapeType.name)
      .attr("class", NODE_SHAPE)
      .on("click", d => this.onClick(d))
      .style("fill", this.getHsl)
      .style("opacity", 0.3)
      .attr(this.shapeType.x, this.getX)
      .attr(this.shapeType.y, this.getY)
      .attr(this.shapeType.size, 0)
      .attr(this.shapeType.width, 0)
      .attr(this.shapeType.height, 0)
      .transition()
        .duration(this.transitionDuration) // time of initial growth
        .attr(this.shapeType.size, this.getR)
        .attr(this.shapeType.width, this.getWidth)
        .attr(this.shapeType.height, this.getHeight);

    let transitions = dataSelection
      .transition()
        .duration(this.transitionDuration) // time of transition
        .style("fill", this.getHsl)
        .style("opacity", 0.3)
        .attr(this.shapeType.x, this.getX)
        .attr(this.shapeType.y, this.getY)
        .attr(this.shapeType.size, this.getR)
        .attr(this.shapeType.width, this.getWidth)
        .attr(this.shapeType.height, this.getHeight);

    dataSelection.exit().remove();
  }

  protected updateShapePositions() {
    this.getNodeShapes()
      .attr(this.shapeType.x, d => d.x)
      .attr(this.shapeType.y, d => d.y)
  }

  protected updateLinePositions() {
    this.getEdgeLines()
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
  }

  addNodeLabels() {
    let dataSelection = this.getDataSelection(this.data.nodes, NODE_LABEL);

    dataSelection.enter()
        .append("text")
        .attr("class", NODE_LABEL)
        .attr("fill", "#000")
        .attr("y", d => this.getY(d)+(this.getR(d)/3))
        .attr("x", d => this.getX(d)-(this.getR(d)))
        .style("font-size", d => this.getR(d))
        .text(this.getText);

    dataSelection
      .transition()
        .duration(500) // time of duration
        .attr("y", d => this.getY(d)+(this.getR(d)/3))
        .attr("x", d => this.getX(d)-(this.getR(d)))
        .style("font-size", d => this.getR(d))
        .text(this.getText);

    dataSelection.exit().remove();
  }

  addEdgeLines() {
    let dataSelection = this.getEdgeLines();

    dataSelection.enter()
      .append("line")
      .attr("class", EDGE_LINE)
      .style("stroke", d => this.getHsl(d.target))
      .style("opacity", 0.1)
      .style("stroke-width", 3)
      //get initial values from animated svg, beautiful hack!
      /*.attr("x1", d => nodes.filter((c, i) => c == d.source)[0][0].cx.baseVal.value)
      .attr("y1", d => nodes.filter((c, i) => c == d.source)[0][0].cy.baseVal.value)
      .attr("x2", d => nodes.filter((c, i) => c == d.target)[0][0].cx.baseVal.value)
      .attr("y2", d => nodes.filter((c, i) => c == d.target)[0][0].cy.baseVal.value)*/
      .transition()
        .duration(this.transitionDuration)
        .attr("x1", d => this.getX(d.source))
        .attr("y1", d => this.getY(d.source))
        .attr("x2", d => this.getX(d.target))
        .attr("y2", d => this.getY(d.target));

    dataSelection
      .transition()
        .duration(this.transitionDuration) // time of duration
        .style("stroke", d => this.getHsl(d.target))
        .style("opacity", 0.1)
        .attr("x1", d => this.getX(d.source))
        .attr("y1", d => this.getY(d.source))
        .attr("x2", d => this.getX(d.target))
        .attr("y2", d => this.getY(d.target));

    dataSelection.exit().remove();
  }

  addEdgeArcs() {
    let dataSelection = this.getDataSelection(this.data.edges, EDGE_LINE);

    let arc = d3.line().curve(d3.curveBasis);
    let getArcPoints = d => {
        let xS = this.getX(d.source);
        let yS = this.getY(d.source);
        let xT = this.getX(d.target);
        let yT = this.getY(d.target);
        let r = Math.abs(xT-xS)/2;
        return arc([[xS, yS], [xS+(r/2), yS-r], [xT-(r/2), yT-r], [xT, yT]]);
    }

    dataSelection.enter()
      .append("path")
      .attr("class", EDGE_LINE)
      .style("stroke", d => this.getHsl(d.target))
      .style("opacity", 0.1)
      .attr("fill", "none")
      .style("stroke-width", 3)
      .attr("d", getArcPoints);

    dataSelection
      .transition()
        .duration(this.transitionDuration) // time of duration
        .style("stroke", d => this.getHsl(d.target))
        .style("opacity", 0.1)
        .attr("fill", "none")
        .style("stroke-width", 3)
        .attr("d", getArcPoints);

    dataSelection.exit().remove();
  }

  updatePlaying(oldVals, newVals) {
    if (oldVals.filter && newVals) {
      this.playingUris = newVals;
      //console.log(JSON.stringify(newVals))
      //console.log(JSON.stringify(oldVals), JSON.stringify(newVals))
      var toSelect = newVals.filter(i => oldVals.indexOf(i) < 0);
      var toDeselect = oldVals.filter(i => newVals.indexOf(i) < 0);
      //console.log(JSON.stringify(toSelect), JSON.stringify(toDeselect))

      var lines = this.svg.selectAll("." + EDGE_LINE);
      lines.filter(e => toSelect.indexOf(this.getHighlightedEdge(e)) >= 0)
        .style("stroke", "black")
        .style("opacity", 0.4);
      lines.filter(e => toDeselect.indexOf(this.getHighlightedEdge(e)) >= 0)
        .style("stroke", e => this.getHsl(e.target))
        .style("opacity", 0.1);

      var circles = this.svg.selectAll("." + NODE_SHAPE);
      circles.filter(d => toSelect.indexOf(d["@id"]) >= 0)
        .style("fill", "black")
        .style("opacity", 0.6);
      circles.filter(d => toDeselect.indexOf(d["@id"]) >= 0)
        .style("fill", this.getHsl)
        .style("opacity", 0.3);
    }
  }

  private getHighlightedEdge(d: JsonEdge) {
    if (this.highlightInEdges) {
      return d.target["@id"];
    }
    return d.source["@id"];
  }

  private createScales() {
    this.xScale = this.createScale(this.viewconfig.xAxis.log);
    this.yScale = this.createScale(this.viewconfig.yAxis.log && !this.noY);
    this.sizeScale = this.createScale(this.viewconfig.size.log);
    this.widthScale = this.createScale(this.viewconfig.xAxis.log);
    this.heightScale = this.createScale(this.viewconfig.yAxis.log);
    this.colorScale = this.createScale(this.viewconfig.color.log);
  }

  private createScale(log) {
    return log ? d3c.scaleLog().base(2) : d3c.scaleLinear();
  }

  private updateScaleDomains() {
    this.updateScaleDomain(this.xScale, this.viewconfig.xAxis);
    if (!this.noY) {
      this.updateScaleDomain(this.yScale, this.viewconfig.yAxis);
    }
    this.updateScaleDomain(this.sizeScale, this.viewconfig.size);
    this.updateScaleDomain(this.widthScale, this.viewconfig.xAxis);
    this.updateScaleDomain(this.heightScale, this.viewconfig.height ? this.viewconfig.height : this.viewconfig.yAxis);
    this.updateScaleDomain(this.colorScale, this.viewconfig.color);
  }

  private updateScaleRanges() {
    this.xScale.range([this.margins.left, this.width-this.margins.right]);
    this.yScale.range([this.height-this.margins.bottom, this.margins.top]);
    this.sizeScale.range([1, 20]);
    this.widthScale.range([0, this.width-this.margins.left-this.margins.right]);
    if (this.viewconfig.height) {
      this.heightScale.range([8, 8]);
    } else {
      this.heightScale.range([0, this.height-this.margins.bottom-this.margins.top]);
    }
    this.colorScale.rangeRound([45, 360]);
  }

  private updateScaleDomain(scale, config) {
    if (config.param) {
      if (config.log) {
        var min = config.param.min;
        if (min <= 0) {
          min = 0.0000001;
        }
        scale.domain([min, config.param.max]);
      } else if (config.param.min != config.param.max) {
        scale.domain([config.param.min, config.param.max]);
      } else {
        //in case all values are the same...
        scale.domain([config.param.min/2, config.param.max*2]);
      }
    }
  }

  private updateAxes() {
    if (this.showAxes) {
      let xTransform = "translate(0," + (this.height - this.margins.bottom) + ")";
      this.xAxis = this.updateAxis(this.xAxis, d3a.axisBottom, this.xScale, "xaxis", xTransform);
      if (!this.noY) {
        let yTransform = "translate(" + this.margins.left + ",0)";
        this.yAxis = this.updateAxis(this.yAxis, d3a.axisLeft, this.yScale, "yaxis", yTransform);
      }
    }
  }

  private updateAxis(axis, constructFunc, scale, axisClass: string, transform: string) {
    if (!axis) {
      axis = constructFunc(scale),
      this.svg.append("g")
        .attr("class", axisClass);
    } else {
      axis.scale(scale);
    }
    this.svg.selectAll("g."+axisClass)
      .attr("transform", transform)
      .call(axis);
    return axis;
  }

  getX = (d, i?) => {
    return this.xScale(this.getVisualValue(d, this.viewconfig.xAxis.param, "x"));
  }

  getY = (d) => {
    if (this.noY) {
      return this.yScale(0);
    }
    let yValue = this.yScale(this.getVisualValue(d, this.viewconfig.yAxis.param, "y"));
    if (this.viewconfig.height && this.viewconfig.height.position != null) {
      if (this.viewconfig.height.position === Position.Start) {
        yValue -= this.getHeight(d);
      } else if (this.viewconfig.height.position === Position.Center) {
        yValue -= this.getHeight(d)/2;
      }
    }
    return yValue;
  }

  getR = (d) => {
    return this.sizeScale(this.getVisualValue(d, this.viewconfig.size.param, "size"));
  }

  getWidth = (d) => {
    return this.widthScale(this.getVisualValue(d, this.viewconfig.width.param, "width"));
  }

  getHeight = (d) => {
    //if no heigh param is defined, the elements reach down to the x-axis
    let heightParam = this.viewconfig.height ? this.viewconfig.height : this.viewconfig.yAxis.param;
    return this.heightScale(this.getVisualValue(d, heightParam, "height"));
  }

  getHsl = (d) => {
    if (this.playingUris.indexOf(d["@id"]) >= 0) {
      return "black";
    }
    return "hsl(" + this.colorScale(this.getVisualValue(d, this.viewconfig.color.param, "color")) + ", 80%, 50%)";
  }

  getRgb = (d) => {
    var color = "rgb(" + this.colorScale(this.getVisualValue(d, this.viewconfig.color.param, "color")) + ","
      + (255-this.colorScale(this.getVisualValue(d, this.viewconfig.color))) + ","
      + this.colorScale(this.getVisualValue(d, this.viewconfig.color)) +")";
    return color;
  }

  //TODO GENERALIZE THIS!!!
  getText = (d) => {
    var text = this.getVisualValue(d, {name:"simplechord"}, "text");
    if (text != 0) {
      return text;
    }
    return "";
  }

  private getVisualValue(dymo, parameter?, key?) {
    if (parameter.name == "random") {
      if (!this.prevRandomValues[dymo["@id"]]) {
        this.prevRandomValues[dymo["@id"]] = {};
      }
      if (!this.prevRandomValues[dymo["@id"]][key]) {
        this.prevRandomValues[dymo["@id"]][key] = Math.random() * parameter.max;
      }
      return this.prevRandomValues[dymo["@id"]][key];
    } else {
      if (this.prevRandomValues[dymo["@id"]] && this.prevRandomValues[dymo["@id"]][key]) {
        delete this.prevRandomValues[dymo["@id"]][key];
      }
      if (dymo["features"]) {
        var value;
        if (Array.isArray(dymo["features"])) {
          var feature = dymo["features"].filter(f => f["@type"] == parameter.name);
          if (feature.length > 0) {
            if (typeof feature[0]["value"] == "string") {
              value = feature[0]["value"];
            } else {
              value = feature[0]["value"]["@value"];
            }
          }
        } else if (dymo["features"]["@type"] == parameter.name) {
          value = dymo["features"]["value"]["@value"];
        }
        if (!isNaN(value)) {
          //not suitable for vectors!! (just takes the first element..)
          if (Array.isArray(value)) {
            value = value[0];
          }
          value = Number(value);
          return value;
        }
        if (typeof value == "string") {
          return value;
        }
      }
      return 0;//0.00000001; //for log scale :(
    }
  }
}