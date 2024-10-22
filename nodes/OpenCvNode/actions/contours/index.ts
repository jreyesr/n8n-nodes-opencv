import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as find from './find.operation';
import * as draw from './draw.operation';


export const description: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		options: [
			{name: "Find", value: "find", description: "Find contours in a binary image", action: "Find contours"},
			{name: "Draw", value: "draw", description: "Draw contours over an image", action: "Draw contours"},
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
	}

	return []
}
