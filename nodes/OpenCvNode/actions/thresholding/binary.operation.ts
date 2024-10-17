import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {Jimp} from "jimp";

export const description: INodeProperties[] = [
	{
		displayName: "Mode",
		name: "mode",
		type: "options",
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{name: "Normal", value: "normal", description: "If pixel > threshold, set to 255. Else, set to 0."},
			{
				name: "Inverted",
				value: "inverted",
				description: "If pixel < threshold, keep as-is. Otherwise, set to threshold."
			},
			{
				name: "Truncate",
				value: "truncate",
				description: "If pixel < threshold, keep as-is. Otherwise, set to threshold."
			},
			{name: 'To Zero', value: "tozero", description: "If pixel < threshold, keep as-is. Otherwise, set to 0."},
			{
				name: 'To Zero (Inverted)',
				value: "tozero_inv",
				description: "If pixel < threshold, set to 0. Otherwise, keep as-is."
			}
		],
		default: "normal",
		required: true,
		displayOptions: {
			show: {
				operation: ['binary'],
			},
		},
	},
	{
		displayName: "Threshold",
		name: "threshold",
		description: "Value to threshold on",
		type: "number",
		default: 128,
		required: true,
		displayOptions: {
			show: {
				operation: ['binary'],
			},
		},
	}
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	let items: INodeExecutionData[] = this.getInputData();
	let toReturn: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];

		const mode = this.getNodeParameter('mode', itemIndex) as string
		const imagePropertyName = this.getNodeParameter("inputImagePropertyName", itemIndex) as string
		const threshold = this.getNodeParameter("threshold", itemIndex) as string

		const newItem: INodeExecutionData = {
			json: item.json,
			binary: item.binary,
			pairedItem: {
				item: itemIndex,
			},
		};

		let cvMode;
		switch (mode) {
			case "normal":
				cvMode = cv.THRESH_BINARY;
				break;
			case "inverted":
				cvMode = cv.THRESH_BINARY_INV;
				break;
			case "truncate":
				cvMode = cv.THRESH_TRUNC;
				break;
			case "tozero":
				cvMode = cv.THRESH_TOZERO;
				break;
			case "tozero_inv":
				cvMode = cv.THRESH_TOZERO_INV;
				break;
			default:
				this.logger.warn("Unknown binary thresh mode", {
					mode,
					executionId: this.getExecutionId(),
					workflowId: this.getWorkflow().id
				})
		}
		this.logger.debug("threshold", {thresh: threshold, type: cvMode})

		this.helpers.assertBinaryData(itemIndex, imagePropertyName);
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
			itemIndex,
			imagePropertyName,
		)
		const jimpImg = await Jimp.fromBuffer(binaryDataBuffer)
		const src = cv.matFromImageData(jimpImg.bitmap);
		const dst = new cv.Mat();
		cv.threshold(src, dst, threshold, 255, cvMode);

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
