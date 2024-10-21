import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as histogram from './histogram.operation';


export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Histogram',
				value: 'histogram',
				description: 'Draws a histogram of the image\'s gray values',
				action: 'Compute histogram',
			},
		],
		default: 'histogram',
		displayOptions: {
			show: {
				module: ['stats'],
			},
		},
	},
	...histogram.description,
]

export const advancedOptions: INodeProperties[] = [
	{
		displayName: 'Histogram Height',
		name: 'height',
		type: 'number',
		default: 200,
		description: 'The name of the binary property that will contain the output image',
		displayOptions: {
			show: {
				'/module': ['stats'],
				'/operation': ['histogram'],
			}
		}
	},
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "histogram":
			return histogram.execute.call(this);
	}
	return []
}
