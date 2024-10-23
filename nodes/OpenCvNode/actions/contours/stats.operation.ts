import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";
import {Contour} from "./contours";

export const description: INodeProperties[] = [
	{
		displayName: "Contour",
		name: "contour",
		description: "Pass a contour, which can come from the Find Contours operation",
		type: "json",
		default: "[]",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["stats"],
			},
		},
	},
];


export const execute = makeProcessor(async function (src, itemIndex, newItem) {
	const contour = this.getNodeParameter("contour", itemIndex, []) as Contour;
	const contourCv: cv.Mat = cv.matFromArray(contour.length, 2, cv.CV_32S, contour.flatMap(({x, y}) => [x, y]))

	const enclosingRect = cv.boundingRect(contourCv);

	newItem.json = {
		area: cv.contourArea(contourCv),
		perimeter: cv.arcLength(contourCv, true),
		isConvex: cv.isContourConvex(contourCv),
		width: enclosingRect.width,
		height: enclosingRect.height,
		enclosingArea: enclosingRect.width * enclosingRect.height,
	}
	contourCv.delete();

	return null
})
