import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as invert from './invert.operation';


export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Invert',
				value: 'invert',
				description: 'Invert the binary image (black to white and white to black)',
				action: 'Invert binary image',
			},

		],
		default: 'invert',
		displayOptions: {
			show: {
				module: ['binaryOps'],
			},
		},
	},
	...invert.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "invert":
			return invert.execute.call(this);
	}
	return []
}
