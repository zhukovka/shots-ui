import * as d3 from "d3";


let svg = d3.select("svg");

//[[-100, -80, 95],
// [-97, -82, 98]]

//[[-100, 97],
// [-80, 82],
// [95, 98]]
function transpose (m: number[][]): number[][] {

    let mT: number[][] = [];
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            if (!mT[j]) {
                mT[j] = [];
            }
            mT[j][i] = m[i][j];
        }
    }
    return mT
}


async function getDataSet () {

    let data = await d3.text("http://kote.local:8142/api/1/storage/R3B/R3B-shot9/coords.csv")
        .then(text => {
            return d3.csvParseRows(text, (rawRow => rawRow.map(Number)))
        });

    let coords = transpose(data.map(row => row.slice(1)));
    let frameNumbers = data.map(row => row.slice(0, 1)[0]);
    return {
        y : "Offset",
        series : coords,
        x : frameNumbers
    };
}

getDataSet().then(dataset => {
    console.log(dataset);
    let margin = ({top : 20, right : 20, bottom : 30, left : 40});
    let height = 600;
    let width = 960;

    let max = d3.max(dataset.series, d => d3.max(d));
    let min = d3.min(dataset.series, d => d3.min(d));
    let y = d3.scaleLinear()
        .domain([min, max]).nice()
        .range([height - margin.bottom, margin.top]);

    let yAxis = (g: any) => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g: any) => g.select(".domain").remove())
        .call((g: any) => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(dataset.y));

    svg.append("g")
        .call(yAxis);

    let x = d3.scaleLinear()
        .domain([0, dataset.x.length])
        .range([margin.left, width - margin.right]);

    let xAxis = (g: any) => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    svg.append("g")
        .call(xAxis);

    let line = d3.line()
    // .defined(d => !isNaN(d))
        .x((d, i) => x(dataset.x[i]))
        .y(d => {
            // @ts-ignore
            return y(d);
        })

    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(dataset.series)
        .enter()
        .append("path")
        .attr("stroke", () => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
        .attr("d", d => {
            // @ts-ignore
            return line(d);
        });

    function hover (svg: any, path: any) {
        svg
            .style("position", "relative");

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

        let getDataFromCoords = function (x: number, y: number) {
            const i1 = d3.bisectLeft(dataset.x, x, 1);
            const i0 = i1 - 1;
            const i = x - dataset.x[i0] > dataset.x[i1] - x ? i1 : i0;
            const s = dataset.series.reduce((a, b) => Math.abs(a[i] - y) < Math.abs(b[i] - y) ? a : b);
            path.filter((d: any) => d === s).raise();
            let dataX = dataset.x[i];
            let dataY = s[i];
            return {dataX, dataY};
        };

        function clicked () {
            d3.event.preventDefault();
            const ym = y.invert(d3.event.layerY);
            const xm = x.invert(d3.event.layerX);
            let {dataX, dataY} = getDataFromCoords(xm, ym);
            console.log(dataX, dataY)
        }

        const dot = svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 2.5);

        function moved () {
            d3.event.preventDefault();
            const ym = y.invert(d3.event.layerY);
            const xm = x.invert(d3.event.layerX);
            let {dataX, dataY} = getDataFromCoords(xm, ym);
            dot.attr("transform", `translate(${x(dataX)},${y(dataY)})`);
        }

        function entered () {
            dot.attr("display", null);
        }

        function left () {
            dot.attr("display", "none");
        }
    }

    svg.call(hover, path);
});

