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

	declare class Mat {
		declare rows: number;
		declare cols: number;

		constructor();

		delete(): void;

		channels(): number;

		size(): { width: number, height: number };

		clone(): cv.Mat;

		static ones: (width: number, height: number, channelSize: any) => Mat;
	}

	declare class MatVector {
		constructor();

		delete(): void;
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
