import {INodeProperties, NodeOperationError} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = [
	{
		displayName: "For information on the two thresholds, see https://justin-liang.com/tutorials/canny/#double-thresholding",
		name: "cannyThresholdNotice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				module: ['edgeDetection'],
				method: ["canny"],
			},
		},
	},
	{
		displayName: "Lower Threshold",
		name: "threshold1",
		type: "number",
		default: 50,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				module: ['edgeDetection'],
				method: ["canny"],
			},
		},
	},
	{
		displayName: "Upper Threshold",
		name: "threshold2",
		type: "number",
		default: 100,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				module: ['edgeDetection'],
				method: ["canny"],
			},
		},
	},
];


export const execute = makeProcessor(async function (src, itemIndex) {
	const apertureSize = this.getNodeParameter("ksize", itemIndex, 3) as number;
	const threshold1 = this.getNodeParameter("threshold1", itemIndex, 50) as number;
	const threshold2 = this.getNodeParameter("threshold2", itemIndex, 100) as number;

	if (apertureSize < 3) {
		throw new NodeOperationError(
			this.getNode(),
			`When using the Canny edge detector, the aperture size should be at least 3, was ${apertureSize}`,
			{
				itemIndex,
				level: "error",
			}
		)
	}

	const dst = new cv.Mat();
	cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
	cv.Canny(src, dst, threshold1, threshold2, apertureSize, false);

	return dst
})
