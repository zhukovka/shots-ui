import {BasicChart, Coords, DataSet} from "./D3Chart";
import * as d3 from "d3";


// const bounds = {x : 20, y : 20, height : 570, width : 920};

let margin = ({top : 20, right : 20, bottom : 30, left : 40});

class LineChart extends BasicChart<DataSet> {
    onClick?: (datum: { x: number, y: number }) => void;

    constructor (dataset: DataSet, frame: Coords) {
        super(dataset, frame);
        this.setScales();
    }

    setScales () {
        let yValues = this.dataset.series;
        let maxY = d3.max(yValues, d => d3.max(d));
        let minY = d3.min(yValues, d => d3.min(d));
        let maxX = this.dataset.x.length;

        let {x, y, width, height} = this.frame;
        this.yScale = d3.scaleLinear()
            .domain([minY, maxY]).nice()
            .range([height - margin.bottom, margin.top]);

        this.xScale = d3.scaleLinear()
            .domain([0, maxX])
            .range([margin.left, width - margin.right]);
    }

    drawOrdinate (svg: d3.Selection<any, any, HTMLElement, any>) {
        let yAxis = (g: any) => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(this.yScale))
            .call((g: any) => g.select(".domain").remove())
            .call((g: any) => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(this.dataset.yLabel));

        svg.append("g")
            .call(yAxis);
    }

    drawAbscissa (svg: d3.Selection<any, any, HTMLElement, any>) {
        let xAxis = (g: any) => g
            .attr("transform", `translate(0,${this.frame.height - margin.bottom})`)
            .call(d3.axisBottom(this.xScale).ticks(this.frame.width / 80).tickSizeOuter(0));

        svg.append("g")
            .call(xAxis);
    }

    drawValues (svg: d3.Selection<any, any, SVGElement, any>) {
        let {series, x, yLabel} = this.dataset;
        let line = d3.line()
        // .defined(d => !isNaN(d))
            .x((d, i) => this.xScale(x[i]))
            .y((d: any) => {
                return this.yScale(d);
            });

        let dataBoundSelection = svg
            .data(series); //Specifies the data to be used to drive the visualization -> _enter: [EnterNode[0], ..., EnterNode[n-1]], _groups: [empty × n]

        let entering = dataBoundSelection
            .enter(); //new visuals will be created in the DOM for each data item -> _groups: [EnterNode[0], ..., EnterNode[n-1]]

        const path = entering
            .append("path"); // appending DOM elements to the selection -> _groups: [path[0], ..., path[n-1]]

        //styling path
        path.attr("stroke", () => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
            .attr("d", d => {
                // @ts-ignore
                return line(d);
            });
    }

    render (svg: d3.Selection<any, any, HTMLElement, any>): void {

        this.drawOrdinate(svg);

        this.drawAbscissa(svg);

        let chartG = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");

        let path = chartG
            .selectAll("path"); // selection for future elements creation -> _groups: NodeList []

        this.drawValues(path);

        svg.call(this.setEventListeners, path);
    }

    setEventListeners = (svg: any, path: any) => {
        let {series, x : xValues, yLabel} = this.dataset;
        svg.style("position", "relative");

        let getDatumFromCoords = function (x: number, y: number) {
            const i1 = d3.bisectLeft(xValues, x, 1);
            const i0 = i1 - 1;
            const i = x - xValues[i0] > xValues[i1] - x ? i1 : i0;
            const s = series.reduce((a, b) => Math.abs(a[i] - y) < Math.abs(b[i] - y) ? a : b);
            path.filter((d: any) => d === s).raise();
            let dataX = xValues[i];
            let dataY = s[i];
            return {x : dataX, y : dataY};
        };

        let clicked = () => {
            d3.event.preventDefault();
            const ym = this.yScale.invert(d3.event.layerY);
            const xm = this.xScale.invert(d3.event.layerX);
            console.log("xm", xm);
            let datum = getDatumFromCoords(xm, ym);
            if (this.onClick) {
                this.onClick(datum);
            }
        };

        const dot = svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 2.5);

        const moved = () => {
            d3.event.preventDefault();
            const ym = this.yScale.invert(d3.event.layerY);
            const xm = this.xScale.invert(d3.event.layerX);
            let {x : dataX, y : dataY} = getDatumFromCoords(xm, ym);
            dot.attr("transform", `translate(${this.xScale(dataX)},${this.yScale(dataY)})`);
        };

        function entered () {
            dot.attr("display", null);
        }

        function left () {
            dot.attr("display", "none");
        }

        if ("ontouchstart" in document) svg
            .style("-webkit-tap-highlight-color", "transparent")
            .on("touchmove", moved)
            .on("touchstart", entered)
            .on("touchend", left);
        else svg
            .on("mousemove", moved)
            .on("mouseenter", entered)
            .on("mouseleave", left);

        svg.on("click", clicked);
    }

}

export default LineChart;