import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {Jimp} from "jimp";

export const description: INodeProperties[] = [
	{
		displayName: "Method",
		name: "method",
		type: "options",
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{name: "Otsu", value: "otsu", description: "Computes the optimal threshold using Otsu's method"},
			{name: "Triangle", value: "triangle", description: "Computes the optimal threshold using the triangle method"},
		],
		default: "otsu",
		required: true,
		displayOptions: {
			show: {
				operation: ['adaptive'],
			},
		},
	}
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	let items: INodeExecutionData[] = this.getInputData();
	let toReturn: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];

		const method = this.getNodeParameter('method', itemIndex) as string
		const imagePropertyName = this.getNodeParameter("inputImagePropertyName", itemIndex) as string

		const newItem: INodeExecutionData = {
			json: {},
			binary: item.binary,
			pairedItem: {
				item: itemIndex,
			},
		};

		let cvMode;
		switch (method) {
			case "otsu":
				cvMode = cv.THRESH_OTSU;
				break;
			case "triangle":
				cvMode = cv.THRESH_TRIANGLE;
				break;
			default:
				this.logger.warn("Unknown adaptive thresh mode", {
					mode: method,
					executionId: this.getExecutionId(),
					workflowId: this.getWorkflow().id
				})
		}
		this.logger.debug("adaptiveThreshold", {method: cvMode})

		this.helpers.assertBinaryData(itemIndex, imagePropertyName);
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
			itemIndex,
			imagePropertyName,
		)
		const jimpImg = await Jimp.fromBuffer(binaryDataBuffer)
		const src = cv.matFromImageData(jimpImg.bitmap);
		const dst = new cv.Mat(), gray = new cv.Mat(), binary = new cv.Mat();
		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0); // Jimp always uses RGBA, so we need to convert to single-channel ourselves
		src.delete();
		let computedThreshold = cv.threshold(gray, binary, 0, 255, cvMode);
		gray.delete();
		cv.cvtColor(binary, dst, cv.COLOR_GRAY2RGBA, 0); // And now back to Jimp's four channels
		binary.delete();

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

		newItem.json.computedThreshold = computedThreshold;

		toReturn.push(newItem)
	}
	return toReturn;
}
