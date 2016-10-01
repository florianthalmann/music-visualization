(function () {
	'use strict';
	
	angular.module('musicVisualization.directives')
		.directive('dymoArcs', ['d3', function(d3) {
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
					
					var helper = new VisualizationHelper(d3, scope, iElement, 35);
					var svg = helper.getSvg();
					
					// define render function
					scope.render = function(data, changedSelection){
						
						helper.update(true);
						
						var nodes = svg.selectAll(".node").data(data["nodes"]);
					
						nodes.enter()
							.append("circle")
							.attr("class", "node")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", helper.getHsl)
							.style("opacity", 0.2)
							.attr("r", 0)
							.attr("cx", helper.getX)
							.attr("cy", helper.getY0)
							.transition()
								.duration(500) // time of duration
								.attr("r", helper.getR); // width based on scale
					
						nodes
							.transition()
								.duration(500) // time of duration
								.style("fill", helper.getHsl)
								.style("opacity", 0.2)
								.attr("r", helper.getR) // width based on scale
								.attr("cx", helper.getX)
								.attr("cy", helper.getY0);
					
						nodes.exit().remove();
						
						var nodeLabel = svg.selectAll(".nodelabel").data(data["nodes"]);
					
						nodeLabel.enter()
								.append("text")
								.attr("class", "nodelabel")
								.attr("fill", "#000")
								.attr("y", function(d){return helper.getY0(d)+(helper.getR(d)/3);})
								.attr("x", function(d){return helper.getX(d)-(helper.getR(d)/3);})
								.style("font-size", function(d){return helper.getR(d)/3})
								.text(helper.getText);
					
						nodeLabel
							.transition()
								.duration(500) // time of duration
								.attr("y", function(d){return helper.getY0(d)+(helper.getR(d)/3);})
								.attr("x", function(d){return helper.getX(d)-(helper.getR(d)/1.5);})
								.style("font-size", function(d){return helper.getR(d)/1.5})
								.text(helper.getText);
					
						nodeLabel.exit().remove();
					
						// scale to generate radians (just for lower-half of circle)
						var radians = d3.scale.linear().range([-Math.PI / 2, Math.PI / 2]);

		    // path generator for arcs (uses polar coordinates)
		    var arc = d3.svg.line.radial()
		        .interpolate("basis")
		        .tension(0)
		        .angle(function(d) { return radians(d); });

		    // add edges
						var edges = svg.selectAll(".edge").data(data["edges"]);
						edges.enter()
		        .append("path")
		        .attr("class", "edge")
						.style("stroke", function(d, i) {return helper.getHsl(d.source);})
						.attr("stroke-width", 3)
						.attr("fill", "none")
						//.style("fill", function(d, i) {return helper.getHsl(d.source);})
						.style("opacity", 0.2)
		        .attr("transform", function(d, i) {
		            // arc will always be drawn around (0, 0)
		            // shift so (0, 0) will be between source and target
		            var xshift = helper.getX(d.source) + (helper.getX(d.target) - helper.getX(d.source)) / 2;
		            var yshift = helper.getY0();
		            return "translate(" + xshift + ", " + yshift + ")";
		        })
		        .attr("d", function(d, i) {
		            // get x distance between source and target
		            var xdist = Math.abs(helper.getX(d.source) - helper.getX(d.target));

		            // set arc radius based on x distance
		            arc.radius(xdist / 2);

		            // want to generate 1/3 as many points per pixel in x direction
		            var points = d3.range(0, Math.ceil(xdist / 3));

		            // set radian scale domain
		            radians.domain([0, points.length - 1]);

		            // return path for arc
		            return arc(points);
		        });
						
				edges
					.transition()
						.duration(0) // time of duration
						.style("stroke", function(d, i) {return helper.getHsl(d.source);})
						.attr("stroke-width", 3)
						.attr("fill", "none")
						//.style("fill", function(d, i) {return helper.getHsl(d.source);})
						.style("opacity", 0.2)
		        .attr("transform", function(d, i) {
		            // arc will always be drawn around (0, 0)
		            // shift so (0, 0) will be between source and target
		            var xshift = helper.getX(d.source) + (helper.getX(d.target) - helper.getX(d.source)) / 2;
		            var yshift = helper.getY0();
		            return "translate(" + xshift + ", " + yshift + ")";
		        })
		        .attr("d", function(d, i) {
		            // get x distance between source and target
		            var xdist = Math.abs(helper.getX(d.source) - helper.getX(d.target));

		            // set arc radius based on x distance
		            arc.radius(xdist / 2);

		            // want to generate 1/3 as many points per pixel in x direction
		            var points = d3.range(0, Math.ceil(xdist / 3));

		            // set radian scale domain
		            radians.domain([0, points.length - 1]);

		            // return path for arc
		            return arc(points);
		        });
						
						edges.exit().remove();
					}
					
				}
			};
		}]);

}());
