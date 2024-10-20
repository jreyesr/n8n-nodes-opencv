import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []
export const execute = makeProcessor(async function (src) {
	const dst = new cv.Mat();
	cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
	return dst
})
