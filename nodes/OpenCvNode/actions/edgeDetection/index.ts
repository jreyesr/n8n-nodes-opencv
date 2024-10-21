import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as laplacian from './laplacian.operation';
import * as sobel from './sobel.operation';
import * as canny from './canny.operation';


export const description: INodeProperties[] = [
	{
		displayName: "Method",
		name: "method",
		type: "options",
		options: [
			{name: "Canny", value: "canny", description: "Extracts edges using the Canny detector"},
			{
				name: "Laplacian",
				value: "laplacian",
				description: "Applies the laplacian operator (second derivative) to obtain edges"
			},
			{name: "Sobel", value: "sobel", description: "Extracts edges using the Sobel operator"},
		],
		default: "laplacian",
		required: true,
		displayOptions: {
			show: {
				module: ['edgeDetection'],
			},
		},
	},
	{
		displayName: "Aperture Size",
		name: "ksize",
		type: "number",
		description: "Aperture size used to compute the derivatives",
		default: 3,
		required: true,
		displayOptions: {
			show: {
				module: ['edgeDetection'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	...laplacian.description,
	...sobel.description,
	...canny.description,
]

export const advancedOptions: INodeProperties[] = [
	{
		displayName: 'Scale',
		name: 'scale',
		type: 'number',
		default: 1,
		description: 'Optional scale factor for the computed gradient values',
		displayOptions: {
			show: {
				"/module": ['edgeDetection'],
				"/method": ['laplacian', 'sobel']
			}
		}
	},
	{
		displayName: 'Delta',
		name: 'delta',
		type: 'number',
		default: 0,
		description: 'Optional delta value that is added to the results',
		displayOptions: {
			show: {
				"/module": ['edgeDetection'],
				"/method": ['laplacian', 'sobel']
			}
		}
	},
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('method', 0);

	switch (operation) {
		case "laplacian":
			return laplacian.execute.call(this);
		case "sobel":
			return sobel.execute.call(this);
		case "canny":
			return canny.execute.call(this);

	}

	return []
}
