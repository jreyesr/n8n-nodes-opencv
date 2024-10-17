import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as binary from './binary.operation';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Binary',
				value: 'binary',
				description: 'Simple binary threshold',
				action: 'Binary threshold',
			},
		],
		default: 'binary',
		displayOptions: {
			show: {
				module: ['thresholding'],
			},
		},
	},
	...binary.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch(operation) {
		case "binary":
			return binary.execute.call(this)
	}
	return []
}
