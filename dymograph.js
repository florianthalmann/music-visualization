(function () {
	'use strict';
	
	angular.module('musicVisualization.directives')
		.directive('dymoGraph', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewconfig: "=",
					playing: "=",
					height: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					
					var helper = new VisualizationHelper(d3, scope, iElement, 35, false, true);
					var svg = helper.getSvg();
					
					var nodes = svg.selectAll(".node"),
						edges = svg.selectAll(".edge");
					
					var force = d3.layout.force()
						.charge(-60)
						.linkDistance(100)
						.on("tick", function() {
								nodes.attr("cx", function(d) { return d.x; })
									.attr("cy", function(d) { return d.y; })
								edges.attr("x1", function(d) { return d.source.x; })
									.attr("y1", function(d) { return d.source.y; })
									.attr("x2", function(d) { return d.target.x; })
									.attr("y2", function(d) { return d.target.y; });
						});
					
					// define render function
					scope.render = function(graph) {
						
						helper.update();
						
						if (graph) {
							force
								.size(helper.getDimension())
								.nodes(graph.nodes)
								.links(graph.edges);
							
							edges = edges.data(force.links());
							edges.enter().insert("line", ".node")
								.attr("class", "edge")
								.attr("stroke", function(d) { return helper.getHsl(d.target); })
								.style("opacity", 0.1)
								.style("stroke-width", 3);
							edges
								.transition()
									.duration(500)
									.attr("stroke", function(d) { return helper.getHsl(d.target); })
									.style("opacity", 0.1)
							edges.exit().remove();
							
							nodes = nodes.data(force.nodes());
							nodes.enter().append("circle")
								.attr("class", "node")
								.attr("r", helper.getR)
								.style("fill", helper.getHsl)
								.style("opacity", 0.4)
								.call(force.drag)
								.on("click", function(d, i){return scope.onClick({item: d});});
							nodes
								.transition()
									.duration(500)
									.style("fill", helper.getHsl)
									.style("opacity", 0.4)
									.attr("r", helper.getR);
							nodes.exit().remove();
							
							force.start();
						}
					}
				}
			};
		}]);

}());
