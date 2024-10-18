import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

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

export const execute = makeProcessor(async function (src, itemIndex, newItem) {
	const method = this.getNodeParameter('method', itemIndex) as string
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

	const dst = new cv.Mat(), gray = new cv.Mat(), binary = new cv.Mat();
	cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0); // Jimp always uses RGBA, so we need to convert to single-channel ourselves
	let computedThreshold = cv.threshold(gray, binary, 0, 255, cvMode);
	gray.delete();
	cv.cvtColor(binary, dst, cv.COLOR_GRAY2RGBA, 0); // And now back to Jimp's four channels
	binary.delete();

	newItem.json = {computedThreshold};

	return dst
})
