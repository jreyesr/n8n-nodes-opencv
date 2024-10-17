import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as thresholding from './actions/thresholding/index';
import * as color from './actions/color/index';
import * as stats from './actions/stats/index';


export const cv = require('./opencv.js');
cv.onRuntimeInitialized = function () {
	console.debug(cv.getBuildInformation())
};


export class OpenCvNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCV',
		name: 'openCvNode',
		icon: "file:opencv_logo.svg",
		group: ["transform"],
		version: 1,
		description: 'OpenCV.js node',
		defaults: {
			name: 'OpenCV',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Input Image Field Name',
				name: 'inputImagePropertyName',
				type: 'string',
				default: "",
				required: true,
				requiresDataPath: 'single',
				description: 'The name of the binary property that will be transformed. Must contain an image.'
			},
			{
				displayName: 'Module',
				name: 'module',
				type: 'options',
				options: [
					{name: "Thresholding", value: "thresholding"},
					{name: "Color Modifications", value: "color"},
					{name: "Image Stats", value: "stats"},
				],
				default: "thresholding",
				required: true,
				description: 'The OpenCV module to use',
			},
			...thresholding.description,
			...color.description,
			...stats.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const module = this.getNodeParameter('module', 0);
		let items: INodeExecutionData[] = [];

		switch (module) {
			case "thresholding":
				items = await thresholding.execute.call(this);
				break;
			case "color":
				items = await color.execute.call(this);
				break;
			case "stats":
				items = await stats.execute.call(this);
				break;
		}

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		// for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		// 	try {
		// 		myString = this.getNodeParameter('myString', itemIndex, '') as string;
		// 		item = items[itemIndex];
		//
		// 		item.json['myString'] = myString;
		// 	} catch (error) {
		// 		// This node should never fail but we want to showcase how
		// 		// to handle errors.
		// 		if (this.continueOnFail()) {
		// 			items.push({json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex});
		// 		} else {
		// 			// Adding `itemIndex` allows other workflows to handle this error
		// 			if (error.context) {
		// 				// If the error thrown already contains the context property,
		// 				// only append the itemIndex
		// 				error.context.itemIndex = itemIndex;
		// 				throw error;
		// 			}
		// 			throw new NodeOperationError(this.getNode(), error, {
		// 				itemIndex,
		// 			});
		// 		}
		// 	}
		// }

		return this.prepareOutputData(items);
	}
}
