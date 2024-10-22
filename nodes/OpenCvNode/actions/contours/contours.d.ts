import {cv} from "../../OpenCvNode.node";

export type ContourList = Contour[];
export type Contour = cv.Point[];

export type ContourHierarchyInfo = { next: number, prev: number, firstChild: number, parent: number };
