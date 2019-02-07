import {BasicChart, Bounds, Coords} from "./D3Chart";
import * as d3 from "d3";

//[[xTL, yTL, xTR, yTR, xBL, yBL, xBR, yBR]]
class FrameChart extends BasicChart<[number, number][][]> {

    constructor (dataset: [number, number][][], frame: Coords, bounds: Bounds) {
        super(dataset, frame);
        this.setScales(bounds);
    }

    setScales ({minX, minY, maxX, maxY}: Bounds) {
        let {x : left, y : top, height : bottom, width : right} = this.frame;
        this.yScale = d3.scaleLinear().domain([minY, maxY]).range([top, bottom]);
        this.xScale = d3.scaleLinear().domain([minX, maxX]).range([left, right]);
    }

    update (dataset: [number, number][][], svg: d3.Selection<any, any, HTMLElement, any>) {
        this.dataset = dataset;
        this.render(svg);
    }

    render (svg: d3.Selection<any, any, HTMLElement, any>): void {

        let line = d3.line()
        // .defined((d: any) => !isNaN(d))
            .x((d: any, i) => this.xScale(d[0]))
            .y((d: any, i) => {
                return this.yScale(d[1]);
            });
        let fn: any = (d: [number, number][]) => {
            return line(d);
        };
        let dataBound = svg.selectAll("path")
            .data(this.dataset);

        //first render
        let entering = dataBound.enter();

        entering
            .append("path")
            .attr("d", fn);

        // updated dataset
        dataBound.attr("d", fn);
    }

}

export default FrameChart;