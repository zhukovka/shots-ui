import * as d3 from "d3";
import LineChart from "./LineChart";
import {DataSet} from "./D3Chart";
import FrameChart from "./FrameChart";


//fn, xTL, yTL, xTR, yTR, xBL, yBL, xBR, yBR
// 0,-100, -80, 95, -86, -97, 57, 98, 54

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


async function getCSV (csvUrl: string) {
    let data = await d3.text(csvUrl)
        .then(text => {
            return d3.csvParseRows(text, (rawRow => rawRow.map(Number)))
        });
    return data;
}


async function getCoords (): Promise<DataSet> {
    let coordsUrl = "/data/R3B-shot9/coords.csv";
    let data = await getCSV(coordsUrl);

    let coords = transpose(data.map(row => row.slice(1)));
    let frameNumbers = data.map(row => row.slice(0, 1)[0]);
    return {
        yLabel : "Offset",
        series : coords,
        x : frameNumbers
    };
}

/**
 *
 * returns a Promise of number[][] of deltas from the mean value in format [[fn, xTL, yTL, xTR, yTR, xBL, yBL, xBR, yBR]]
 */
async function getDeltas (): Promise<number[][]> {
    let deltasUrl = "/data/R3B-shot9/delta.csv";
    return await getCSV(deltasUrl);
}

/**
 *
 * @param d [xTL, yTL, xTR, yTR, xBL, yBL, xBR, yBR]
 * return [[xTL, yTL], [xTR, yTR], [xBL, yBL], [xBR, yBR]]
 * @param w
 * @param h
 */
function toLinePoints (d: number[], w: number, h: number): [number, number][] {
    let points: [number, number][] = [];
    points[0] = [d[0], d[1]];
    points[1] = [d[2] + w, d[3]];
    points[2] = [d[6] + w, d[7] + h];
    points[3] = [d[4], d[5] + h];
    points[4] = points[0];
    return points;
}

async function visualizeData () {
    const coords = await getCoords();
    console.log(coords);
    const deltas = await getDeltas();
    console.log(deltas);
    let video = {
        "width" : 1800,
        "height" : 1300,
    };

    let vbounds = {minX : -100, minY : -100, maxX : 1900, maxY : 1400};
    let vframe = {x : 0, y : 0, width : 900, height : 650};
    let frameSVG = d3.select("#frame");
    let videoSVG = frameSVG.append("g")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    let points = toLinePoints([0, 0, 0, 0, 0, 0, 0, 0], video.width, video.height);
    const baseFrame = new FrameChart([points], vframe, vbounds);
    baseFrame.render(videoSVG);

    let homographySVG = frameSVG.append("g")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5);
    let framePoints = toLinePoints(deltas[0].slice(1), video.width, video.height);
    const homographyFrame = new FrameChart([framePoints], vframe, vbounds);
    homographyFrame.render(homographySVG);

    let svg = d3.select("#chart");
    const frame = {x : 0, y : 0, width : 960, height : 600};
    let lineChart = new LineChart(coords, frame);
    lineChart.render(svg);
    lineChart.onClick = ({x, y}) => {
        console.log(x, y);
        console.log(deltas[x]);
        let framePoints = toLinePoints(deltas[x].slice(1), video.width, video.height);
        console.log(framePoints)
        homographyFrame.update([framePoints], homographySVG);
    };

}

visualizeData()

