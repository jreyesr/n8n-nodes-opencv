import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []

export const execute = makeProcessor(async function (src) {
	const dst = new cv.Mat(), gray = new cv.Mat();
	cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
	cv.bitwise_not(gray, dst);
	gray.delete();

	return dst
})
