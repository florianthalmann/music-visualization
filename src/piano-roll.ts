import { MusicVisualization } from './music-visualization';
import { Rectangle } from './types';

export class PianoRoll extends MusicVisualization {

	constructor(element, onClick) {
		super(element, {top: 0, bottom: 12, left: 35, right: 0}, true, true, false, onClick);
	}

	updateDataRepresentation() {
		this.addNodeShapes(Rectangle);
	};

}
