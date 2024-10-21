import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = [];

export const execute = makeProcessor(async function (src, itemIndex) {
	const ksize = this.getNodeParameter("ksize", itemIndex, 3) as number;
	const scale = this.getNodeParameter("scale", itemIndex, 1) as number;
	const delta = this.getNodeParameter("delta", itemIndex, 0) as number;

	const dst = new cv.Mat();
	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	// NOTE: We use 64F because negative gradients are possible, and using 8U would lose the negative grads
	cv.Laplacian(src, dst, cv.CV_64F, ksize, scale, delta);
	cv.convertScaleAbs(dst, dst, 1, 0); // dst = saturate_to_255(abs(dst_old))

	return dst
})
