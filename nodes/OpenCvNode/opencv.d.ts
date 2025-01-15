declare namespace cv {
	// Data types
	declare const CV_32S: number, CV_8U: number, CV_16U: number, CV_8UC3: number;

	declare const RETR_EXTERNAL: number, RETR_LIST: number, RETR_CCOMP: number, RETR_TREE: number, RETR_FLOODFILL: number;

	declare function matFromArray(rows: number, cols: number, type: any, array: number[]): cv.Mat;

	declare function findContours(src: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number, offset?: Point)

	declare function contourArea(contour: Mat, oriented: boolean = false): number;

	declare function arcLength(contour: Mat, closed: boolean): number;

	declare function convexHull(contour: Mat, hull: Point[], clockwise: boolean = false, returnPoints: boolean = true): void;

	declare function isContourConvex(contour: Mat): boolean;

	declare function boundingRect(points: Mat): Rect;

	declare function minAreaRect(points: Mat): Rect;

	/**
	 * Computes the connected components labeled image of boolean image.
	 * @param src The 8-bit single-channel image to be labeled
	 * @param labels Destination labeled image, each pixel's value (number) is the label/index of that pixel's component
	 * @param connectivity Whether to use 8-way or 4-way connectivity (up/down/left/right only, or also corners, respectively)
	 * @param ltype Output image label type, determines the maximum number of labels that can be handled
	 * @returns The total number of labels [0, N-1] where 0 represents the background label
	 */
	declare function connectedComponents(src: Mat, labels: Mat, connectivity?: 4 | 8 = 8, ltype?: CV_32S | CV_16U = CV_32S): number;

	/**
	 * OpenCV's core matrix class, a 2D array of values. Typically used to hold images (each value in the 2D array is a pixel),
	 * but can also hold other data structures (e.g. a Nx2 matrix may be used to represent a list of points, where each of the N
	 * rows is a point, with the 2 columns being the X and Y coordinates of the point)
	 */
	declare class Mat {
		declare rows: number;
		declare cols: number;

		constructor();
		constructor(size: { width: number, height: number }, type: cv.CV_8U | cv.CV_16U | cv.CV_32S);
		constructor(rows: number, cols: number, type: cv.CV_8U | cv.CV_16U | cv.CV_32S);
		constructor(rows: number, cols: number, type: cv.CV_8U | cv.CV_16U | cv.CV_32S, initialColor: Scalar);

		/** Must be called on each {@link Mat}, once it's no longer required. Otherwise, memory leaks will occur */
		delete(): void;

		/** Returns the number of color channels in the image (e.g. 1 for a grayscale image, 3 for an RGB image, or 4 for an RGB+alpha image) */
		channels(): number;

		size(): { width: number, height: number };

		/** Creates a copy of this image's data, that can be modified separately */
		clone(): cv.Mat;

		/** Converts this Mat to another data type, optionally scaling all values with a linear function first: ``Y_ij = alpha * X_ij + beta`` */
		convertTo(dst: Mat, rtype: cv.CV_8U | cv.CV_16U | cv.CV_32S, alpha?: number = 1, beta?: number = 0): void;

		/** Creates a copy of this image's data, that can be modified separately */
		copyTo(dst: Mat, mask?: Mat): void;

		/** Returns whether this {@link Mat}'s data is arranged as a single long vector, with no gaps at the end of each row */
		isContinuous(): boolean;

		/** Creates a {@link Mat} of a specified MxN size, filled with ones (1) */
		static ones: (width: number, height: number, channelSize: any) => Mat;
	}

	/**
	 * Holds a set of {@link Mat}s, such as for representing a series of images or splitting an image into its component channels
	 */
	declare class MatVector {
		constructor();

		/** Releases this {@link MatVector}'s memory. Unconfirmed: does it release all {@link Mat}s that are contained in it too? */
		delete(): void;

		/** Returns the number of {@link Mat}s that are contained in this vector */
		size(): number;

		/** Returns the {@link Mat} that is stored at a certain index in this {@link MatVector} */
		get(i: number): Mat;
	}

	declare class Point {
		declare x: number;
		declare y: number;

		constructor(x: number, y: number);
	}

	declare class Rect {
		declare x: number;
		declare y: number;
		declare width: number;
		declare height: number;
	}

	declare type Scalar = [number, number, number, number];
}
