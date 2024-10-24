declare namespace cv {
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
	 * OpenCV's core matrix class, a 2D array of values. Typically used to hold images (each value in the 2D array is a pixel),
	 * but can also hold other data structures (e.g. a Nx2 matrix may be used to represent a list of points, where each of the N
	 * rows is a point, with the 2 columns being the X and Y coordinates of the point)
	 */
	declare class Mat {
		declare rows: number;
		declare cols: number;

		constructor();

		/** Must be called on each {@link Mat}, once it's no longer required. Otherwise, memory leaks will occur */
		delete(): void;

		/** Returns the number of color channels in the image (e.g. 1 for a grayscale image, 3 for an RGB image, or 4 for an RGB+alpha image) */
		channels(): number;

		size(): { width: number, height: number };

		/** Creates a copy of this image's data, that can be modified separately */
		clone(): cv.Mat;

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
}
