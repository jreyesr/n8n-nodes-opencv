import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";
import {Jimp} from "jimp";
import {cv} from "../../OpenCvNode.node";

export const description: INodeProperties[] = []

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	let items: INodeExecutionData[] = this.getInputData();
	let toReturn: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];
		const imagePropertyName = this.getNodeParameter("inputImagePropertyName", itemIndex) as string

		const newItem: INodeExecutionData = {
			json: item.json,
			binary: item.binary,
			pairedItem: {
				item: itemIndex,
			},
		};

		this.helpers.assertBinaryData(itemIndex, imagePropertyName);
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
			itemIndex,
			imagePropertyName,
		)
		const jimpImg = await Jimp.fromBuffer(binaryDataBuffer)
		const src = cv.matFromImageData(jimpImg.bitmap);
		cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		const srcVec = new cv.MatVector();
		srcVec.push_back(src);
		const hist = new cv.Mat(), mask = new cv.Mat();
		const color = new cv.Scalar(255, 255, 255);
		cv.calcHist(srcVec, [0], new cv.Mat(), hist, [256], [0, 255], false);

		const result = cv.minMaxLoc(hist, mask);
		mask.delete();
		const max = result.maxVal;
		const rgbHist = new cv.Mat.zeros(src.rows, 256, cv.CV_8UC3);

		for (let i = 0; i < 256; i++) {
			const binVal = hist.data32F[i] * src.rows / max;
			const point1 = new cv.Point(i, src.rows - 1);
			const point2 = new cv.Point((i + 1) - 1, src.rows - binVal);
			cv.rectangle(rgbHist, point1, point2, color, cv.FILLED);
		}
		src.delete(); hist.delete();
		const dst = new cv.Mat();
		cv.cvtColor(rgbHist, dst, cv.COLOR_RGB2RGBA, 0);
		rgbHist.delete();

		const binaryData = await this.helpers.prepareBinaryData(await new Jimp({
			width: dst.cols,
			height: dst.rows,
			data: Buffer.from(dst.data)
		}).getBuffer("image/png"));
		newItem.binary!["out"] = {
			...newItem.binary![imagePropertyName],
			...binaryData,
			mimeType: "image/png",
		};
		dst.delete();

		toReturn.push(newItem)
	}
	return toReturn;
}
