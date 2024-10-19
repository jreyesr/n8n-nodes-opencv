declare namespace cv {
	declare class Mat {
		declare rows: int;

		delete();
		channels(): number;

		static ones: (width: number, height: number, channelSize: any) => Mat;
	}
}
