import {BasicChart, Bounds, Coords} from "./D3Chart";
import * as d3 from "d3";

//[[xTL, yTL, xTR, yTR, xBL, yBL, xBR, yBR]]
class FrameChart extends BasicChart<[number, number][]> {

    constructor (dataset: [number, number][], frame: Coords, bounds: Bounds) {
        super(dataset, frame);
        this.setScales(bounds);
    }

    setScales ({minX, minY, maxX, maxY}: Bounds) {
        let {x : left, y : top, height : bottom, width : right} = this.frame;
        this.yScale = d3.scaleLinear().domain([minY, maxY]).range([top, bottom]);
        this.xScale = d3.scaleLinear().domain([minX, maxX]).range([left, right]);
    }

    update (dataset: [number, number][], svg: d3.Selection<any, any, HTMLElement, any>) {
        this.dataset = dataset;
        this.render(svg);
    }

    render (svg: d3.Selection<any, any, HTMLElement, any>): void {

        let line = d3.line()
        // .defined((d: any) => !isNaN(d))
            .x((d: any) => this.xScale(d[0]))
            .y((d: any) => {
                return this.yScale(d[1]);
            });

        let dataset = this.dataset.concat([this.dataset[0]]);
        let dataBound = svg.selectAll("path")
            .data([dataset]);
        //first render
        let entering = dataBound.enter();

        entering
            .append("path")
            .attr("d", line);

        // updated dataset
        dataBound.attr("d", line);
    }

}

export default FrameChart;