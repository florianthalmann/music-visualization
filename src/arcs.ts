import { MusicVisualization } from './music-visualization';
import { Circle } from './types';

export class Arcs extends MusicVisualization {

	constructor(element, onClick) {
		super(element, {top: 0, bottom: 12, left: 35, right: 0}, true, true, true, onClick);
	}

	updateDataRepresentation() {
		this.addNodeShapes(Circle);
		this.addNodeLabels();
		this.addEdgeArcs();
	};

}