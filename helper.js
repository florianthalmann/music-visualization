function VisualizationHelper(d3, scope, iElement, padding, showAxes, highlightInEdges) {
	
	var self = this;
	
	var svg = d3.select(iElement[0])
		.append("svg")
		.attr("width", "100%")
		.attr("height", scope.height? scope.height: 500);
	
	var prevRandomValues = {};
	
	var xAxis, yAxis;
	var xScale, yScale, sizeScale, colorScale;
	var width;
	var height = svg.attr("height");
	
	init();
	
	function init() {
		if (showAxes) {
			// Axes. Note the inverted domain for the y-scale: bigger is up!
			xAxis = d3.svg.axis().orient("bottom"),
			yAxis = d3.svg.axis().orient("left");
		
			svg.append("g")
				.attr("class", "xaxis")  //Assign "axis" class
				.attr("transform", "translate(0," + (height - padding) + ")")
				.call(xAxis);
	
			svg.append("g")
				.attr("class", "yaxis")
				.attr("transform", "translate(" + padding + ",0)")
				.call(yAxis);
		}
	
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
			lines.filter(function(d) { return toSelect.indexOf(getHighlightedEdge(d)) >= 0 })
				.style("stroke", "black")
				.style("opacity", 0.4);
			lines.filter(function(d) { return toDeselect.indexOf(getHighlightedEdge(d)) >= 0 })
				.style("stroke", function(d) { return self.getHsl(d.target); })
				.style("opacity", 0.1);
			
			var circles = svg.selectAll(".node");
			circles.filter(function(d) {return toSelect.indexOf(CONTEXT_URI+d["@id"]) >= 0 })
				.style("fill", "black")
				.style("opacity", 0.6);
			circles.filter(function(d) { return toDeselect.indexOf(CONTEXT_URI+d["@id"]) >= 0 })
				.style("fill", self.getHsl)
				.style("opacity", 0.3);
		}, true);
		
		function getHighlightedEdge(d) {
			if (highlightInEdges) {
				return CONTEXT_URI+d.target["@id"];
			}
			return CONTEXT_URI+d.source["@id"];
		}
	}
	
	this.getSvg = function() {
		return svg;
	}
	
	this.getDimension = function() {
		return [width, height]
	}
	
	this.update = function(noY) {
		width = d3.select(iElement[0])[0][0].offsetWidth - padding;
		
		xScale = createScale(scope.viewconfig.xAxis.log, scope.viewconfig.xAxis.param).range([padding, width-padding]);
		if (noY) {
			yScale = d3.scale.linear().range([height-padding, padding]);
		} else {
			yScale = createScale(scope.viewconfig.yAxis.log, scope.viewconfig.yAxis.param).range([height-padding, padding]);
		}
		sizeScale = createScale(scope.viewconfig.size.log, scope.viewconfig.size.param).range([10, 40]);
		widthScale = createScale(scope.viewconfig.xAxis.log, scope.viewconfig.xAxis.param).range([0, width-2*padding]);
		heightScale = createScale(scope.viewconfig.yAxis.log, scope.viewconfig.yAxis.param).range([0, height-2*padding]);
		colorScale = createScale(scope.viewconfig.color.log, scope.viewconfig.color.param).rangeRound([45, 360]);
		if (showAxes) {
			xAxis.scale(xScale).tickFormat(d3.format(".g"));
			yAxis.scale(yScale).tickFormat(d3.format(".g"));
			svg.selectAll("g.xaxis")
				.call(xAxis);
			svg.selectAll("g.yaxis")
				.call(yAxis);
		}
	}
	
	function createScale(log, param) {
		if (log) {
			var min = param.min;
			if (min <= 0) {
				min = 0.0000001;
			}
			return d3.scale.log().base(2).domain([min, param.max]);
		}
		if (param.min != param.max) {
			return d3.scale.linear().domain([param.min, param.max]);
		}
		//in case all values are the same...
		return d3.scale.linear().domain([param.min/2, param.max*2]);
	}
	
	this.getX = function(d, i) {
		return xScale(getVisualValue(d, {name:"time"}));//return xScale(getVisualValue(d, scope.viewconfig.xAxis.param, "x"));
	}
	
	this.getY0 = function() {
		return yScale(0);
	}
	
	this.getY = function(d, i) {
		return yScale(getVisualValue(d, scope.viewconfig.yAxis.param, "y"));
	}
	
	this.getR = function(d) {
		return sizeScale(getVisualValue(d, scope.viewconfig.size.param, "size"));
	}
	
	this.getWidth = function(d) {
		return widthScale(getVisualValue(d, {name:"duration"}, "width"));
	}
	
	this.getHeight = function(d) {
		if (d["@id"] != "dymo0") {
			return heightScale(getVisualValue(d, scope.viewconfig.yAxis.param, "height"));
		}
		return 0;
	}
	
	this.getHsl = function(d) {
		if (scope.playing.indexOf(CONTEXT_URI+d["@id"]) >= 0) {
			return "black";
		}
		return "hsl(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ", 80%, 50%)";
	}
	
	this.getRgb = function(d) {
		var color = "rgb(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ","
			+ (255-colorScale(getVisualValue(d, scope.viewconfig.color))) + ","
			+ colorScale(getVisualValue(d, scope.viewconfig.color)) +")";
		return color;
	}
	
	this.getText = function(d) {
		return getVisualValue(d, {name:"simplechord"}, "text");
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
			if (dymo["features"]) {
				var value;
				if (Array.isArray(dymo["features"])) {
					var feature = dymo["features"].filter(function(f){return f["@type"] == parameter.name;});
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
				//console.log(parameter.name, value)
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