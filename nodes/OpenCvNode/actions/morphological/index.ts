import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as erode from './erode.operation';
import * as dilate from './dilate.operation';
import * as opening from './opening.operation';
import * as closing from './closing.operation';
import * as gradient from './gradient.operation';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Erode',
				value: 'erode',
				description: 'Thins out white areas',
				action: 'Erode',
			},
			{
				name: 'Dilate',
				value: 'dilate',
				description: 'Enlarges white areas',
				action: 'Dilate',
			},
			{
				name: 'Opening',
				value: 'opening',
				description: 'Erosion → dilation, removes scattered white pixels',
				action: 'Opening',
			},
			{
				name: 'Closing',
				value: 'closing',
				description: 'Dilation → erosion, closes small holes in white objects and removes scattered black pixels',
				action: 'Closing',
			},
			{
				name: 'Morphological Gradient',
				value: 'gradient',
				description: 'Difference between dilation and erosion, highlights border pixels',
				action: 'Morphological gradient',
			}
		],
		default: 'erode',
		displayOptions: {
			show: {
				module: ['morphological'],
			},
		},
	},
	{
		displayName: "Kernel Size",
		name: "kernelSize",
		type: "number",
		default: 1,
		hint: "Use odd numbers only. Kernels are squares",
		displayOptions: {
			show: {
				module: ['morphological'],
			},
		},
	},
	...erode.description,
	...dilate.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case "erode":
			return erode.execute.call(this);
		case "dilate":
			return dilate.execute.call(this);
		case "opening":
			return opening.execute.call(this);
		case "closing":
			return closing.execute.call(this);
		case "gradient":
			return gradient.execute.call(this);
	}
	return []
}
