import {IExecuteFunctions, INodeExecutionData} from "n8n-workflow";
import {Jimp} from "jimp";
import {cv} from "../OpenCvNode.node";

type NodeExecuteFunction = (this: IExecuteFunctions) => Promise<INodeExecutionData[]>
export type ProcessorFunction = (this: IExecuteFunctions, src: cv.Mat, itemIndex: number, newItem: INodeExecutionData) => Promise<cv.Mat>

/**
 * Higher-order function that builds the skeleton of an `execute()` call (read parameters, read the input image to
 * a Jimp object and then to an OpenCV cv.Mat, then invoke node-provided code against that cv.Mat, and finally read the
 * returned Mat back into a Jimp object and then a N8N binary file).
 *
 * @param process A callback function that will receive a cv.Mat (the input image) and should return an output image. Its
 *                `this` value is set to the IExecuteFunctions that `execute()` functions have available too
 */
export function makeProcessor(process: ProcessorFunction): NodeExecuteFunction {
	return async function (this: IExecuteFunctions): Promise<INodeExecutionData[]> {
		let items: INodeExecutionData[] = this.getInputData();
		let toReturn: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];
			const imagePropertyName = this.getNodeParameter("inputImagePropertyName", itemIndex) as string;
			const outputPropertyName = this.getNodeParameter('advancedOptions.outputImagePropertyName', itemIndex, 'out', {
				extractValue: true,
			}) as string;

			const newItem: INodeExecutionData = {
				json: item.json,
				binary: item.binary,
				pairedItem: {
					item: itemIndex,
				},
			};

			this.helpers.assertBinaryData(itemIndex, imagePropertyName);
			const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
				itemIndex,
				imagePropertyName,
			)
			const jimpImg = await Jimp.fromBuffer(binaryDataBuffer)
			const src = cv.matFromImageData(jimpImg.bitmap);

			this.logger.debug("Calling node-specific transform function...")
			const dst = await process.call(this, src, itemIndex, newItem);
			src.delete();
			if (dst.channels() === 3) {
				this.logger.debug(`Returned Mat is RGB, should be RGBA. Correcting`);
				cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA, 0); // Add the A channel back, Jimp needs it
			} else if (dst.channels() === 1) {
				this.logger.debug(`Returned Mat is grayscale, should be RGBA. Correcting`);
				cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
			} else if (dst.channels() !== 4) {
				throw new Error(`BUG: Returned Mat has ${dst.channels()} channels, should have 4. This is likely a bug in the node, please report to the maintainers.`)
			}
			// now we're sure that dst is RGBA

			const binaryData = await this.helpers.prepareBinaryData(await new Jimp({
				width: dst.cols,
				height: dst.rows,
				data: Buffer.from(dst.data)
			}).getBuffer("image/png"));
			newItem.binary![outputPropertyName] = {
				...newItem.binary![imagePropertyName],
				...binaryData,
				mimeType: "image/png",
			};
			dst.delete();

			toReturn.push(newItem)
		}
		return toReturn;
	}
}
