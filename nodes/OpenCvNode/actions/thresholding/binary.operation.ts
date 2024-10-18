import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

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

export const execute = makeProcessor(async function (src, itemIndex) {
	const mode = this.getNodeParameter('mode', itemIndex) as string;
	const threshold = this.getNodeParameter("threshold", itemIndex) as string;

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
	this.logger.debug("threshold", {thresh: threshold, type: cvMode});

	const dst = new cv.Mat();
	cv.threshold(src, dst, threshold, 255, cvMode);

	return dst;
})
