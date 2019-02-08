import FrameChart from "./FrameChart";
import * as d3 from "d3";

class EditableFrame extends FrameChart {
    render (svg: d3.Selection<any, any, HTMLElement, any>): void {
        super.render(svg);
        let dataBound = svg.selectAll("circle")
            .data(this.dataset);

        //first render
        let entering = dataBound.enter();

        let r = 10;
        entering
            .append("circle")
            .attr("fill", "transparent")
            .attr("cx", (d, i) => {
                return this.xScale(d[0]);
            })
            .attr("cy", (d, i) => {
                return this.yScale(d[1]);
            })
            .attr("r", r)
            .call(d3.drag()
                .on('drag', (d: [number, number], i: any) => {
                    const datum = this.dataset[i];
                    const {dx, dy} = d3.event;
                    const x = this.xScale(datum[0]);
                    const y = this.yScale(datum[1]);
                    let x1 = this.xScale.invert(x + dx);
                    let y1 = this.yScale.invert(y + dy);
                    this.dataset[i] = [x1, y1];
                    this.render(svg);
                }));

        // updated dataset
        dataBound
            .attr("cx", (d, i) => {
                return this.xScale(d[0]);
            })
            .attr("cy", (d, i) => {
                return this.yScale(d[1]);
            });

    }

}

export default EditableFrame;