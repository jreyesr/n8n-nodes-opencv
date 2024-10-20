import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";

export const description: INodeProperties[] = [
	{
		displayName: "See https://browncsci1290.github.io/webpage/labs/bilateral/ for information on the parameters",
		name: "bilateralNotice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				module: ["blur"],
				mode: ["bilateral"],
			}
		},
	},
	{
		displayName: "Color Sigma",
		name: "colorSigma",
		description: "Filter sigma in the color space (AKA \"range sigma\"). A larger value of the parameter means that farther colors within the pixel neighborhood will be mixed together.",
		type: "number",
		default: 75,
		displayOptions: {
			show: {
				module: ["blur"],
				mode: ["bilateral"],
			}
		},
	},
	{
		displayName: "Spatial Sigma",
		name: "spaceSigma",
		description: "Filter sigma in the coordinate space. A larger value of the parameter means that farther pixels will influence each other as long as their colors are close enough.",
		type: "number",
		default: 75,
		displayOptions: {
			show: {
				module: ["blur"],
				mode: ["bilateral"],
			}
		},
	},
]

export const execute = makeProcessor(async function (src, itemIndex) {
	const ksize = this.getNodeParameter("ksize", itemIndex, 3) as number;
	const colorSigma = this.getNodeParameter("colorSigma", itemIndex, 75) as number;
	const spaceSigma = this.getNodeParameter("spaceSigma", itemIndex, 75) as number;

	cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
	const dst = new cv.Mat();
	cv.bilateralFilter(src, dst, ksize, colorSigma, spaceSigma);

	return dst
})
