declare namespace cv {
	declare class Mat {
		declare rows: int;

		delete();

		static ones: (width: number, height: number, channelSize: any) => Mat;
	}
}
