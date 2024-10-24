import {IBinaryData, IExecuteFunctions, INodeExecutionData} from "n8n-workflow";
import {Jimp} from "jimp";
import {cv} from "../OpenCvNode.node";

type NodeExecuteFunction = (this: IExecuteFunctions) => Promise<INodeExecutionData[]>
/**
 * A function that receives a {@link cv.Mat} containing an image, processes it, and returns a new image. Can optionally
 * set JSON data that will be returned in the node's ``$json`` fields.
 *
 * @param this {IExecuteFunctions} The function's ``this`` value is set to the same as in the node's ``execute()`` function. It contains
 * 						 useful functions to, for example, fetch the input data, get node parameters, or access workflow metadata
 * @param src {cv.Mat} A {@link cv.Mat} that contains the input image, decoded from a binary item in the N8N input item. This
 * 						matrix will be handled by the node code, the processor function doesn't need to call {@link cv.Mat#delete} on it
 * @param itemIndex {number} The item number (0 for the first item, and so on), if the node was called with multiple input items
 * @param newItem {INodeExecutionData} The half-filled data that will be returned from the node. Exposed here so the processor function can,
 *                if necessary, set data in the node's JSON output. By default, OpenCV nodes will output no JSON data
 * @returns {Promise<cv.Mat | null>} Optionally, a new {@link cv.Mat} with a processed image. Can also be ``null``, if it
 *          makes no sense for the node to return data (e.g. a node that computes image statistics)
 */
export type ProcessorFunction = (this: IExecuteFunctions, src: cv.Mat, itemIndex: number, newItem: INodeExecutionData) => Promise<cv.Mat | null>

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
			const imagePropertyName = this.getNodeParameter("inputImagePropertyName", itemIndex, null) as string | null;
			const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex, {}) as {outputImagePropertyName?: string};
			const outputPropertyName = advancedOptions?.outputImagePropertyName ?? "out";

			const newItem: INodeExecutionData = {
				json: item.json,
				binary: item.binary,
				pairedItem: {
					item: itemIndex,
				},
			};

			let src = new cv.Mat();
			if (imagePropertyName !== null) {
				this.helpers.assertBinaryData(itemIndex, imagePropertyName);
				const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
					itemIndex,
					imagePropertyName,
				)
				const jimpImg = await Jimp.fromBuffer(binaryDataBuffer)
				src = cv.matFromImageData(jimpImg.bitmap);
			}

			this.logger.debug("Calling node-specific transform function...")
			const dst = await process.call(this, src, itemIndex, newItem);
			src.delete();

			if (dst !== null) { // may be null, which means that the node doesn't generate an image (e.g. stats or contour detection)
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

				const defaultOutData: IBinaryData = {
					mimeType: "image/png",
					fileType: "image",
					fileName: `${outputPropertyName}.png`,
					data: "",
					fileExtension: "png"
				};
				const binaryData = await this.helpers.prepareBinaryData(await new Jimp({
					width: dst.cols,
					height: dst.rows,
					data: Buffer.from(dst.data)
				}).getBuffer("image/png"));
				newItem.binary![outputPropertyName] = {
					...(imagePropertyName ? newItem.binary![imagePropertyName] : defaultOutData),
					...binaryData,
					mimeType: "image/png",
				};
				dst.delete();
			}

			toReturn.push(newItem)
		}
		return toReturn;
	}
}
