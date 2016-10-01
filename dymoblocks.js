(function () {
	'use strict';
	
	angular.module('musicVisualization.directives')
		.directive('dymoBlocks', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewconfig: "=",
					playing: "=",
					height: "=",
					axes: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var helper = new VisualizationHelper(d3, scope, iElement, 35, scope.axes);
					var svg = helper.getSvg();
					
					// define render function
					scope.render = function(data, changedSelection){
						
						helper.update();
						
						var nodes = svg.selectAll(".node").data(data["nodes"]);
						
						nodes.enter()
							.append("rect")
							.attr("class", "node")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", helper.getHsl)
							.style("opacity", 0.4)
							.attr("x", helper.getX)
							.attr("y", helper.getY)
							.attr("width", helper.getWidth)
							.attr("height", helper.getHeight)
							.transition()
								.duration(500) // time of duration
								.attr("height", helper.getHeight); // width based on scale
						
						nodes
							.transition()
								.duration(500) // time of duration
								.style("fill", helper.getHsl)
								.style("opacity", 0.4)
								.attr("x", helper.getX)
								.attr("y", helper.getY)
								.attr("width", helper.getWidth)
								.attr("height", helper.getHeight);
						
						nodes.exit().remove();
						
					};
					
				}
			};
		}]);

}());
