import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []

export const execute = makeProcessor(async function (src, itemIndex) {
	const HEIGHT = this.getNodeParameter('advancedOptions.height', itemIndex, 200, {
		extractValue: true,
	}) as number;

	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	const srcVec = new cv.MatVector();
	srcVec.push_back(src);
	const hist = new cv.Mat(), mask = new cv.Mat();
	const color = new cv.Scalar(255, 255, 255);
	cv.calcHist(srcVec, [0], new cv.Mat(), hist, [256], [0, 255], false);

	const result = cv.minMaxLoc(hist, mask);
	mask.delete();
	const max = result.maxVal;
	const dst = new cv.Mat.zeros(HEIGHT, 256, cv.CV_8UC3);

	for (let i = 0; i < 256; i++) {
		const binVal = hist.data32F[i] * HEIGHT / max;
		const point1 = new cv.Point(i, HEIGHT - 1);
		const point2 = new cv.Point((i + 1) - 1, HEIGHT - binVal);
		cv.rectangle(dst, point1, point2, color, cv.FILLED);
	}
	hist.delete();

	return dst;
})
