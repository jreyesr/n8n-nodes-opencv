declare namespace cv {
	declare function matFromArray(rows: number, cols: number, type: any, array: number[]): cv.Mat;

	declare class Mat {
		declare rows: number;
		declare cols: number;

		constructor();
		delete();
		channels(): number;
		size(): {width: number, height: number};
		clone(): cv.Mat;

		static ones: (width: number, height: number, channelSize: any) => Mat;
	}

	declare class Point {
		declare x: number;
		declare y: number;

		constructor(x: number, y: number);
	}
}
