import { MusicVisualization } from './music-visualization';
import { Ellipse } from './types';

export class Form extends MusicVisualization {

	constructor(element, onClick) {
		super(element, {top: 0, bottom: 12, left: 35, right: 0}, true, true, false, onClick);
	}

	//TODO NEEDS TO BE WORKED ON!!! INVERTED Y AXIS VALUES ETC...
	updateDataRepresentation() {
		this.addNodeShapes(Ellipse);
		this.addNodeLabels();
	};

}
