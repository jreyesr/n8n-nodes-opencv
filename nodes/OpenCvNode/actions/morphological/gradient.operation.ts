import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []
export const execute = makeProcessor(async function (src, itemIndex) {
	const kernelSize = this.getNodeParameter("kernelSize", itemIndex, 1) as number

	const dst = new cv.Mat();
	const M: cv.Mat = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
	// NOTE: As per https://docs.opencv.org/4.x/d4/d76/tutorial_js_morphological_ops.html#autotoc_md1692,
	// the gradient needs RGB (no A) images, so we drop the A channel first
	cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
	cv.morphologyEx(src, dst, cv.MORPH_GRADIENT, M);
	M.delete()

	return dst
})
