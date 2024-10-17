import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as grayscale from './grayscale.operation';


export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'To Grayscale',
				value: 'toGrayscale',
				description: 'Convert the image into grayscale',
				action: 'To grayscale',
			},

		],
		default: 'toGrayscale',
		displayOptions: {
			show: {
				module: ['color'],
			},
		},
	},
	...grayscale.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "toGrayscale":
			return grayscale.execute.call(this);
	}
	return []
}
