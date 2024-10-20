import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []

export const execute = makeProcessor(async function (src, itemIndex) {
	const ksize = this.getNodeParameter("ksize", itemIndex, 3) as number;

	const dst = new cv.Mat();
	cv.GaussianBlur(src, dst, new cv.Size(ksize, ksize), 0, 0);

	return dst
})
