import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";
import {ContourHierarchyInfo, ContourList} from "./contours";

export const description: INodeProperties[] = [
	{
		displayName: "Contours",
		name: "contours",
		hint: "A list of contours, each with a list of points that make it up. See the output of the Find Contours operation",
		type: "json",
		default: "[]",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["draw"],
			},
		},
	},
	{
		displayName: "Hierarchy",
		name: "hierarchy",
		hint: "Information about which contours are inside which contours",
		type: "json",
		default: "[]",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["draw"],
			},
		},
	},
];

export const advancedOptions: INodeProperties[] = [
	{
		displayName: "Color",
		name: "color",
		type: "color",
		default: "#ff0000",
		description: "Color to draw the contours on",
		displayOptions: {
			show: {
				"/module": ['contours'],
				"/operation": ['draw']
			}
		}
	},
	{
		displayName: "Line Width",
		name: "lineWidth",
		type: "number",
		default: 1,
		typeOptions: {
			minValue: 1
		},
		displayOptions: {
			show: {
				"/module": ['contours'],
				"/operation": ['draw']
			}
		}
	},
]

export const execute = makeProcessor(async function (src, itemIndex, newItem) {
	const contours = this.getNodeParameter("contours", itemIndex, []) as ContourList;
	const hierarchy = this.getNodeParameter("hierarchy", itemIndex, []) as ContourHierarchyInfo[];
	const color = this.getNodeParameter("advancedOptions.color", itemIndex, "#ff0000") as string;
	const colorAsNum = parseInt(color.replace("#", ""), 16)
	const r = (colorAsNum >> 16) % 256, g = (colorAsNum >> 8) % 256, b = colorAsNum % 256;
	const lineWidth = this.getNodeParameter("advancedOptions.lineWidth", itemIndex, 1) as number;
	console.log(src.channels());

	const contoursCv = new cv.MatVector();
	for (let contour of contours) {
		const contourCv = cv.matFromArray(contour.length, 2, cv.CV_32S, contour.flatMap(({x, y}) => [x, y]))
		contoursCv.push_back(contourCv)
	}

	const hierarchyCv = cv.matFromArray(hierarchy.length, 4, cv.CV_32S, hierarchy.flatMap(
		({next, prev, firstChild, parent}) => [next, prev, firstChild, parent]))

	const dst = src.clone();
	cv.drawContours(dst, contoursCv, -1, new cv.Scalar(r, g, b, 255), lineWidth, cv.LINE_8, hierarchyCv)

	return dst
})
