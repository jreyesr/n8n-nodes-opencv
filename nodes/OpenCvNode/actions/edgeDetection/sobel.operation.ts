import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = [];

export const execute = makeProcessor(async function (src, itemIndex) {
	const ksize = this.getNodeParameter("ksize", itemIndex, 3) as number;
	const scale = this.getNodeParameter("scale", itemIndex, 1) as number;
	const delta = this.getNodeParameter("delta", itemIndex, 0) as number;

	const dst = new cv.Mat(), gradX = new cv.Mat(), gradY = new cv.Mat();
	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

	// NOTE: We use 64F because negative gradients are possible, and using 8U would lose the negative grads
	cv.Sobel(src, gradX, cv.CV_64F, 1, 0, ksize, scale, delta);
	cv.Sobel(src, gradY, cv.CV_64F, 0, 1, ksize, scale, delta);
	cv.convertScaleAbs(gradX, gradX, 1, 0); // dst = saturate_to_255(abs(dst_old))
	cv.convertScaleAbs(gradY, gradY, 1, 0);

	// Approximate gradient as 0.5*gradX + 0.5*gradY (faster than sqrt(gradX^2+gradY^2)
	// This is done on https://docs.opencv.org/4.x/d2/d2c/tutorial_sobel_derivatives.html too
	cv.addWeighted(gradX, 0.5, gradY, 0.5, 0, dst);

	return dst
})
