(function () {
	'use strict';
	
	angular.module('dymoDesigner.directives')
		.directive('dymoChords', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewconfig: "=",
					playing: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");
					
					var height = 300;
					var padding = 50;
					var previousColors = null;
					var prevRandomValues = {};
					
					var xScale, yScale, sizeScale, heightScale, colorScale;
					
					// Axes. Note the inverted domain for the y-scale: bigger is up!
					var xAxis = d3.svg.axis().orient("bottom"),
					yAxis = d3.svg.axis().orient("left");
					
					svg.append("g")
						.attr("class", "xaxis")  //Assign "axis" class
						.attr("transform", "translate(0," + (height - padding) + ")")
						.call(xAxis);
				
					svg.append("g")
						.attr("class", "yaxis")
						.attr("transform", "translate(" + padding + ",0)")
						.call(yAxis);
					
					// on window resize, re-render d3 canvas
					window.onresize = function() {
						return scope.$apply();
					};
					scope.$watch(function(){
							return angular.element(window)[0].innerWidth;
						}, function(){
							return scope.render(scope.data);
						}
					);
					
					// watch for data changes and re-render
					scope.$watch('data', function(newVals, oldVals) {
						return scope.render(newVals);
					}, true);
					
					scope.$watch('viewconfig', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('playing', function(newVals, oldVals) {
						var toSelect = newVals.filter(function(i) {return oldVals.indexOf(i) < 0;});
						var toDeselect = oldVals.filter(function(i) {return newVals.indexOf(i) < 0;});
						
						var lines = svg.selectAll(".edge");
						lines.filter(function(d) { return toSelect.indexOf(d.target["@id"]) >= 0 })
							.style("stroke", "black")
							.style("opacity", 0.4);
						lines.filter(function(d) { return toDeselect.indexOf(d.target["@id"]) >= 0 })
							.style("stroke", function(d) { return getHsl(d.target); })
							.style("opacity", 0.1);
						
						var circles = svg.selectAll("circle");
						circles.filter(function(d) { return toSelect.indexOf(d["@id"]) >= 0 })
							.style("fill", "black")
							.style("opacity", 0.6);
						circles.filter(function(d) { return toDeselect.indexOf(d["@id"]) >= 0 })
							.style("fill", getHsl)
							.style("opacity", 0.3);
					}, true);
					
					// define render function
					scope.render = function(data, changedSelection){
						// setup variables
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for paddings and can be changed
						// set the height based on the calculations above
						svg.attr('height', height);
						
						xScale = createScale(scope.viewconfig.xAxis.log, scope.viewconfig.xAxis.param).range([padding, width-padding]),
						yScale = d3.scale.linear().domain([0, 4]).range([height-padding, padding]),
						sizeScale = d3.scale.linear().domain([0, scope.viewconfig.xAxis.param.max]).range([0, width-(2*padding)]),
						heightScale = d3.scale.linear().domain([0, 4]).range([0, height-(2*padding)]),
						colorScale = createScale(scope.viewconfig.color.log, scope.viewconfig.color.param).rangeRound([45, 360]);
						
						function createScale(log, param) {
							if (log) {
								var min = param.min;
								if (min <= 0) {
									min = 0.0000001;
								}
								return d3.scale.log().base(2).domain([min, param.max]);
							}
							return d3.scale.linear().domain([param.min, param.max]);
						}
						
						xAxis.scale(xScale).tickFormat(d3.format(".g"));
						yAxis.scale(yScale).tickFormat(d3.format(".g"));
						
						//update axes
						svg.selectAll("g.xaxis")
							.call(xAxis);
						svg.selectAll("g.yaxis")
							.call(yAxis);
						
						/*var circles = svg.selectAll("circle").data(data["nodes"]);
						
						circles.enter()
							.append("circle")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", getHsl)
							.style("opacity", 0.2)
							.attr("r", 0)
							.attr("cx", getXValue)
							.attr("cy", getYValue)
							.transition()
								.duration(500) // time of duration
								.attr("r", getR); // width based on scale
						
						circles
							.transition()
								.duration(500) // time of duration
								.style("fill", getHsl)
								.style("opacity", 0.2)
								.attr("r", getR) // width based on scale
								.attr("cx", getXValue)
								.attr("cy", getYValue);
						
						circles.exit().remove();*/
						
						var ellipses = svg.selectAll("ellipse").data(data["nodes"]);
						
						ellipses.enter()
							.append("ellipse")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", getHsl)
							.style("opacity", 0.3)
							.attr("cx", getXValue)
							.attr("cy", getYValue)
							.attr("rx", getWidth)
							.attr("ry", getHeight)
							.transition()
								.duration(500) // time of duration
								.attr("height", getHeight); // width based on scale
						
						ellipses
							.transition()
								.duration(500) // time of duration
								.style("fill", getHsl)
								.style("opacity", 0.3)
								.attr("cx", getXValue)
								.attr("cy", getYValue)
								.attr("rx", getWidth)
								.attr("ry", getHeight);
						
						ellipses.exit().remove();
						
					};
					
					
					function getXValue(d, i) {
						if (d["time"] && d["duration"]) {
							return xScale(d["time"].value + d["duration"].value/2);
						}
						return 0;
					}
					
					function getYValue(d, i) {
						return yScale(0);
					}
					
					function getHeight(d) {
						if (d["level"]) {
							return heightScale(4-d["level"].value);
						}
						return 0;
					}
					
					function getWidth(d) {
						if (d["time"] && d["duration"]) {
							return sizeScale(d["duration"].value/2);
						}
						return 0;
					}
					
					function getHsl(d) {
						if (scope.playing.indexOf(d["@id"]) >= 0) {
							return "black";
						}
						return "hsl(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ", 80%, 50%)";
					}
					
					function getRgb(d) {
						var color = "rgb(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ","
							+ (255-colorScale(getVisualValue(d, scope.viewconfig.color))) + ","
							+ colorScale(getVisualValue(d, scope.viewconfig.color)) +")";
						return color;
					}
					
					function getVisualValue(dymo, parameter, key) {
						if (parameter.name == "random") {
							if (!prevRandomValues[dymo["@id"]]) {
								prevRandomValues[dymo["@id"]] = {};
							}
							if (!prevRandomValues[dymo["@id"]][key]) {
								prevRandomValues[dymo["@id"]][key] = Math.random() * parameter.max;
							}
							return prevRandomValues[dymo["@id"]][key];
						} else {
							if (prevRandomValues[dymo["@id"]] && prevRandomValues[dymo["@id"]][key]) {
								delete prevRandomValues[dymo["@id"]][key];
							}
							if (dymo[parameter.name]) {
								//not suitable for vectors!! (just takes the first element..)
								var value = dymo[parameter.name].value;
								if (value.length) {
									value = value[0];
								}
								return value;
							}
							return 0;//0.00000001; //for log scale :(
						}
					}
					
				}
			};
		}]);

}());