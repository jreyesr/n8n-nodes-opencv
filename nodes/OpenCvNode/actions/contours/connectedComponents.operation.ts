import crypto from "crypto"

import {INodeProperties, NodeOperationError} from "n8n-workflow";
import {cv} from "../../OpenCvNode.node";
import {makeProcessor} from "../general";
import {lfsr} from "../../lfsr";

export const description: INodeProperties[] = [
	{
		displayName: "Output Mode",
		name: "outputMode",
		type: "options",
		options: [
			{
				name: "Random Colors",
				value: "randomColors",
				description: "Returns an image where each component has a random color. The background (always component 0) will always be black."
			},
			{
				name: "Label Image",
				value: "labelImage",
				description: "Returns a grayscale image"
			},
		],
		default: "randomColors",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["connectedComponents"],
			},
		},
	},
	{
		displayName: "The Label Image mode can only be used if the image will have less than 256 connected components. Otherwise, it'll fail.",
		name: "noticeConnectedComponentsLabelLimit",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				module: ['contours'],
				operation: ["connectedComponents"],
				outputMode: ["labelImage"]
			},
		}
	},
];


export const execute = makeProcessor(async function (src, itemIndex) {
	const outputMode = this.getNodeParameter("outputMode", itemIndex, "randomColors") as "randomColors" | "labelImage";

	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
	const labels = new cv.Mat();
	const totalComponents = cv.connectedComponents(src, labels, 8, outputMode === "randomColors" ? cv.CV_32S : cv.CV_16U);

	if (outputMode === "labelImage" && totalComponents > 256) {
		throw new NodeOperationError(
			this.getNode(),
			`This image has ${totalComponents} components, but at most 256 are supported when using the Label Image mode. Consider using morphological operations to reduce the number of separate clusters, or change the mode to Random Colors to output an image.`,
			{
				itemIndex,
				level: "error",
			}
		)
	}

	let dst = new cv.Mat(labels.size(), cv.CV_8UC3);
	if (outputMode === "randomColors") {
		const generator = lfsr();
		let palette = Array(totalComponents).fill(0);
		for (let i = 0; i < totalComponents; i++) {
			const pseudoRand = generator.next().value
			const hashedValue = crypto.createHash("md5").update(pseudoRand!.toString()).digest("binary")
			const hashedNumber = parseInt(hashedValue.substring(0, 24), 2)
			console.log(pseudoRand, hashedValue, hashedNumber)
			palette[i] = [hashedNumber >> 16, (hashedNumber >> 8) % 256, hashedNumber % 256]
		}
		console.log(palette)

		const p = function (c: number): number[] {
			return [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [0, 255, 255], [255, 0, 255], [128, 0, 0], [0, 128, 0], [0, 0, 128]][c % 10]
		};

		for (let r = 0; r < dst.rows; r++) {
			for (let c = 0; c < dst.cols; c++) {
				const inColor = labels.ucharPtr(r, c)[0], outPixel = dst.ucharPtr(r, c);
				const outColor = p(inColor);
				outPixel[0] = outColor[0];
				outPixel[1] = outColor[1];
				outPixel[2] = outColor[2];
				// dst.data[offsetOut] = outColor;
				// dst.data[offsetOut + 1] = outColor[1];
				// dst.data[offsetOut + 2] = outColor[2];
			}
		}
	} else { // outputMode === "labelImage"
		labels.convertTo(dst, cv.CV_8U) // Just drop from 16bit to 8bit
	}
	labels.delete();

	return dst;
})
