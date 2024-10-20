import {IExecuteFunctions, INodeExecutionData, INodeProperties} from "n8n-workflow";

import * as box from './box.operation';
import * as gaussian from './gaussian.operation';
import * as median from './median.operation';
import * as bilateral from './bilateral.operation';


export const description: INodeProperties[] = [
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Box Blur (Averaging)',
				value: 'box',
				description: 'Replaces each pixel with the average pixel value of a region around it',
				action: 'Box blur',
			},
			{
				name: 'Gaussian Blur',
				value: 'gaussian',
				description: 'Replaces each pixel with a weighted average of it neighbors, using weights from a 2D Gaussian',
				action: 'Gaussian blur',
			},
			{
				name: 'Median Blur',
				value: 'median',
				description: 'Replaces each pixel with the median value of its neighborhood. Useful to remove impulse (e.g. salt-and-pepper) noise.',
				action: 'Median blur',
			},
			{
				name: 'Bilateral Filter',
				value: 'bilateral',
				description: 'Useful at keeping edges sharp. Slower than the other methods.',
				action: 'Bilateral filter',
			},
		],
		default: 'box',
		displayOptions: {
			show: {
				module: ['blur'],
			},
		},
	},
	{
		displayName: "Window Size",
		name: "ksize",
		description: "Size of the kernel/window where averaging will be performed",
		type: "number",
		default: 3,
		displayOptions: {
			show: {
				module: ["blur"],
				mode: ["box", "gaussian", "median", "bilateral"],
			}
		},
	},
	...box.description,
	...gaussian.description,
	...median.description,
	...bilateral.description,
]

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const mode = this.getNodeParameter('mode', 0);

	switch (mode) {
		case "box":
			return box.execute.call(this);
		case "gaussian":
			return gaussian.execute.call(this);
		case "median":
			return median.execute.call(this);
		case "bilateral":
			return bilateral.execute.call(this);
	}
	return []
}
