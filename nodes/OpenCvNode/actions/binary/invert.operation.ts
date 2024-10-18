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
		const dst = new cv.Mat(), gray = new cv.Mat();
		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
		cv.bitwise_not(gray, dst);
		// HACK: So Jimp can pack this back into an image, otherwise it gets confused
		// (Jimp can't handle single-channel images, only RGBA)
		cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
		src.delete();

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
