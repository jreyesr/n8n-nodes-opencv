import {INodeProperties} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";
import {ContourHierarchyInfo, ContourList} from "./contours";

export const description: INodeProperties[] = [
	{
		displayName: "Contour Retrieval Mode",
		name: "retrievalMode",
		type: "options",
		options: [
			{name: "External Only", value: "RETR_EXTERNAL", description: "Retrieves only the extreme outer contours"},
			{
				name: "List of Contours",
				value: "RETR_LIST",
				description: "Retrieves all of the contours without establishing any hierarchical relationships"
			},
			{
				name: "Connected Components",
				value: "RETR_CCOMP",
				description: "Retrieves all of the contours and organizes them into a two-level hierarchy (external boundaries at the first level, holes in the second level)"
			},
			{
				name: "Tree",
				value: "RETR_TREE",
				description: "Retrieves all of the contours and reconstructs a full hierarchy of nested contours"
			},
		],
		default: "RETR_CCOMP",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["find"],
			},
		},
	},
	{
		displayName: "Contour Approximation Method",
		name: "approxMethod",
		type: "options",
		options: [
			{name: "None", value: "CHAIN_APPROX_NONE", description: "Stores absolutely all the contour points"},
			{
				name: "Simplify Line Segments",
				value: "CHAIN_APPROX_SIMPLE",
				description: "Compresses horizontal, vertical, and diagonal segments and leaves only their end points"
			},
		],
		default: "CHAIN_APPROX_NONE",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["find"],
			},
		},
	},
];


export const execute = makeProcessor(async function (src, itemIndex, newItem) {
	const retrievalMode = this.getNodeParameter("retrievalMode", itemIndex, "RETR_CCOMP") as string;
	const approxMethod = this.getNodeParameter("approxMethod", itemIndex, "CHAIN_APPROX_NONE") as string;

	const contours = new cv.MatVector();
	const hierarchy = new cv.Mat();
	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	cv.findContours(src, contours, hierarchy, cv[retrievalMode], cv[approxMethod]);

	// contours is a cv.MatVector of N CV_32S matrices, each (M rows, 4 cols) in size (each of the N matrices has a different M!)
	// Each element of the MatVector is a contour, M is the number of line segments in that contour, 4 is for the start&end points, each with X and Y coords
	// Within each matrix, each row's 4 values are (startX, startY, endX, endY)
	const contourPoints: ContourList = [];
	for (let i = 0; i < contours.size(); i++) {
		contourPoints.push([]);
		for (let j = 0; j < contours.get(i).rows; j++) {
			const x = contours.get(i).data32S[j * 2], y = contours.get(i).data32S[j * 2 + 1];
			if (x === undefined && y === undefined) break
			contourPoints[i].push(new cv.Point(x, y));
		}
	}
	contours.delete();

	// hierarchy comes in a (N rows, 4 cols) Mat with CV_32F values
	// For each row:
	// col0 = idx of next contour at this contour's hierarcy level, or -1 if it's the last one
	// col1 = idx of prev contour at this one's hierarchy level, or -1 if it's the first
	// col2 = idx of first child contour of this one, or -1 if this one has no children
	// col3 = idx of this contour's parent contour, or -1 if it's on top level
	const outHierarchy: ContourHierarchyInfo[] = [];
	for (let i = 0; i < hierarchy.size().width; i++) {
		outHierarchy.push({
			next: hierarchy.data32S[4 * i],
			prev: hierarchy.data32S[4 * i + 1],
			firstChild: hierarchy.data32S[4 * i + 2],
			parent: hierarchy.data32S[4 * i + 3],
		})
	}
	hierarchy.delete();

	newItem.json = {
		contours: contourPoints,
		hierarchy: outHierarchy,
	}
	return null
})
