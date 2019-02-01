import * as d3 from "d3";


let svg = d3.select("svg");

async function getDataSet () {

    let data = await d3.text("http://kote.local:8142/api/1/storage/R3B/R3B-shot9/coords.csv")
        .then(text => {
            return d3.csvParseRows(text, (rawRow => rawRow.map(Number)))
        });

    let coords = data.map(row => row.slice(1));
    let frameNumbers = data.map(row => row.slice(0, 1));
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

    // let xAxis = d3.axisBottom();
    // svg.append("g")
    //     .call(xAxis);

});