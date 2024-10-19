import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as binary from './binary.operation';
import * as automatic from './automatic.operation';
import * as adaptive from './adaptive.operation';


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
			{
				name: 'Automatic',
				value: 'automatic',
				description: 'Thresholds where the value is computed automatically',
				action: 'Automatic threshold',
			},
			{
				name: 'Adaptive',
				value: 'adaptive',
				description: 'Adaptive threshold that adapts to brightness changes across the image',
				action: 'Adaptive threshold',
			}
		],
		default: 'binary',
		displayOptions: {
			show: {
				module: ['thresholding'],
			},
		},
	},
	...binary.description,
	...automatic.description,
	...adaptive.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "binary":
			return binary.execute.call(this);
		case "automatic":
			return automatic.execute.call(this);
		case "adaptive":
			return adaptive.execute.call(this);
	}
	return []
}
