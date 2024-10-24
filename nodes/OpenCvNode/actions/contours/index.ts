import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as find from './find.operation';
import * as draw from './draw.operation';
import * as stats from './stats.operation';


export const description: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		options: [
			{name: "Find", value: "find", description: "Find contours in a binary image", action: "Find contours"},
			{name: "Draw", value: "draw", description: "Draw contours over an image", action: "Draw contours"},
			{name: "Stats", value: "contourStats", description: "Compute some stats for a single contour", action: "Contour stats"},
		],
		default: "find",
		required: true,
		displayOptions: {
			show: {
				module: ['contours'],
			},
		},
	},
	...find.description,
	...draw.description,
	...stats.description,
]

export const advancedOptions: INodeProperties[] = [
	...draw.advancedOptions,
]


export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "find":
			return find.execute.call(this);
		case "draw":
			return draw.execute.call(this);
		case "contourStats":
			return stats.execute.call(this);
	}

	return []
}
