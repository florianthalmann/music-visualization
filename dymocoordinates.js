(function () {
	'use strict';
	
	angular.module('musicVisualization.directives')
		.directive('dymoCoordinates', ['d3', function(d3) {
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
					
					var helper = new VisualizationHelper(d3, scope, iElement, 35, true, true);
					var svg = helper.getSvg();
					
					// define render function
					scope.render = function(data, changedSelection){
						
						helper.update();
						
						var nodes = svg.selectAll(".node").data(data["nodes"]);
						
						nodes.enter()
							.append("circle")
							.attr("class", "node")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", helper.getHsl)
							.style("opacity", 0.3)
							.attr("r", 0)
							.attr("cx", helper.getX)
							.attr("cy", helper.getY)
							.transition()
								.duration(500) // time of duration
								.attr("r", helper.getR); // width based on scale
						
						nodes
							.transition()
								.duration(500) // time of duration
								.style("fill", helper.getHsl)
								.style("opacity", 0.3)
								.attr("r", helper.getR) // width based on scale
								.attr("cx", helper.getX)
								.attr("cy", helper.getY);
						
						nodes.exit().remove();
						
						var nodeLabel = svg.selectAll(".nodelabel").data(data["nodes"]);
						
						nodeLabel.enter()
								.append("text")
								.attr("class", "nodelabel")
								.attr("fill", "#000")
								.attr("y", function(d){return helper.getY(d)+(helper.getR(d)/3);})
								.attr("x", function(d){return helper.getX(d)-(helper.getR(d));})
								.style("font-size", function(d){return helper.getR(d)})
								.text(helper.getText);
						
						nodeLabel
							.transition()
								.duration(500) // time of duration
								.attr("y", function(d){return helper.getY(d)+(helper.getR(d)/3);})
								.attr("x", function(d){return helper.getX(d)-(helper.getR(d));})
								.style("font-size", function(d){return helper.getR(d)})
								.text(helper.getText);
						
						nodeLabel.exit().remove();
						
						var edges = svg.selectAll(".edge").data(data["edges"]);
						
						edges.enter()
							.append("line")
							.attr("class", "edge")
							.style("stroke", function(d) { return helper.getHsl(d.target); })
							.style("opacity", 0.1)
							.style("stroke-width", 3)
							//get initial values from animated svg, beautiful hack!
							.attr("x1", function(d) { return nodes.filter(function(c, i) { return c == d.source; })[0][0].cx.baseVal.value; })
							.attr("y1", function(d) { return nodes.filter(function(c, i) { return c == d.source; })[0][0].cy.baseVal.value; })
							.attr("x2", function(d) { return nodes.filter(function(c, i) { return c == d.target; })[0][0].cx.baseVal.value; })
							.attr("y2", function(d) { return nodes.filter(function(c, i) { return c == d.target; })[0][0].cy.baseVal.value; })
							.transition()
								.duration(500)
								.attr("x1", function(d) { return helper.getX(d.source); })
								.attr("y1", function(d) { return helper.getY(d.source); })
								.attr("x2", function(d) { return helper.getX(d.target); })
								.attr("y2", function(d) { return helper.getY(d.target); });
						
						edges
							.transition()
								.duration(500) // time of duration
								.style("stroke", function(d) { return helper.getHsl(d.target); })
								.style("opacity", 0.1)
								.attr("x1", function(d) { return helper.getX(d.source); })
								.attr("y1", function(d) { return helper.getY(d.source); })
								.attr("x2", function(d) { return helper.getX(d.target); })
								.attr("y2", function(d) { return helper.getY(d.target); });
						
						edges.exit().remove();
						
					};
					
				}
			};
		}]);

}());
