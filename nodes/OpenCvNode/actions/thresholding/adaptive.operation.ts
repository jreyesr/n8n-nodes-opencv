import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = [
	{
		displayName: "Block Size",
		name: "blockSize",
		type: "number",
		default: 3,
		required: true,
		hint: "Size of a pixel neighborhood that is used to calculate a threshold value for the pixel. Must be an odd value.",
		displayOptions: {
			show: {
				operation: ['adaptive'],
			},
		},
	},
	{
		displayName: "C",
		name: "C",
		type: "number",
		default: 10,
		required: true,
		hint: "Constant subtracted from the mean or weighted mean",
		displayOptions: {
			show: {
				operation: ['adaptive'],
			},
		},
	},
]

export const execute = makeProcessor(async function (src, itemIndex, newItem) {
	const blockSize = this.getNodeParameter('blockSize', itemIndex) as number
	const C = this.getNodeParameter('C', itemIndex) as number

	const dst = new cv.Mat();
	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, blockSize, C);

	return dst
})
