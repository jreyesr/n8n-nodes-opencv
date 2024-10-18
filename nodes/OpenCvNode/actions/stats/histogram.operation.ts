import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = []

export const execute = makeProcessor(async function (src) {
	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	const srcVec = new cv.MatVector();
	srcVec.push_back(src);
	const hist = new cv.Mat(), mask = new cv.Mat();
	const color = new cv.Scalar(255, 255, 255);
	cv.calcHist(srcVec, [0], new cv.Mat(), hist, [256], [0, 255], false);

	const result = cv.minMaxLoc(hist, mask);
	mask.delete();
	const max = result.maxVal;
	const HEIGHT = src.rows;
	const rgbHist = new cv.Mat.zeros(HEIGHT, 256, cv.CV_8UC3);

	for (let i = 0; i < 256; i++) {
		const binVal = hist.data32F[i] * HEIGHT / max;
		const point1 = new cv.Point(i, HEIGHT - 1);
		const point2 = new cv.Point((i + 1) - 1, HEIGHT - binVal);
		cv.rectangle(rgbHist, point1, point2, color, cv.FILLED);
	}
	hist.delete();
	const dst = new cv.Mat();
	cv.cvtColor(rgbHist, dst, cv.COLOR_RGB2RGBA, 0);
	rgbHist.delete();

	return dst;
})
