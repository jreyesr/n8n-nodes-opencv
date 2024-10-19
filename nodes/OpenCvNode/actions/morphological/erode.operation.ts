import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []
export const execute = makeProcessor(async function (src, itemIndex) {
	const kernelSize = this.getNodeParameter("kernelSize", itemIndex, 1) as number

	const dst = new cv.Mat();
	const M: cv.Mat = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
	cv.erode(src, dst, M);
	M.delete()

	return dst
})
