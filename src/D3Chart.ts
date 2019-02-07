import * as d3 from "d3";
import {ScaleLinear} from "d3";

export interface D3Chart<T> {
    dataset: T;
    yScale: d3.ScaleLinear<number, number>;
    xScale: d3.ScaleLinear<number, number>;

    render (svg: d3.Selection<any, any, HTMLElement, any>): void;
}

export type Coords = { x: number, y: number, width: number, height: number };
export type DataSet = { series: number[][]; x: number[]; yLabel?: string; xLabel?: string; };

export type Bounds = { minX: number, minY: number, maxX: number, maxY: number };

export class BasicChart<T> implements D3Chart<T> {
    dataset: T;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    protected frame: Coords;

    render (svg: d3.Selection<any, any, HTMLElement, any>): void {
    }

    constructor (dataset: T, frame: Coords) {
        this.dataset = dataset;
        this.frame = frame;
    }


}