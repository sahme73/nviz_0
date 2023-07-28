window.width = 0;
window.height = 0;

function create_chart_3(data) {
    // Step 0: Calculate the percentage of race distrution based on month

    /**
     * Race Keys:
     * 1 = white
     * 2 = black
     * 3 = hispanic
     * 4 = asian or pacific islander
     * 5 = native american
     * 6 = other
     * 
     * Admission Month:
     * 1-12 = jan-dec
     */
    const totals = [-1, 0, 0, 0, 0, 0, 0];
    const distribution = new Map(); //key: {month, race} | value: count
    for (var m = 1; m <= 12; m++) {
        for (var r = 1; r <= 6; r++) {
            var key = JSON.stringify({ month: m, race: r });
            distribution.set(key, 0);
        }
    }
    data.forEach(patient => {
        const aptMonth = parseInt(patient.AMONTH);
        const race = parseInt(patient.RACE);
        if (isNaN(aptMonth) || isNaN(race)) {
            totals[6] += 1;
            return;
        }
        totals[race] += 1;
        var key = JSON.stringify({ month: aptMonth, race: race });
        distribution.set(key, (distribution.get(key) ?? 0) + 1);
    });
    console.log(distribution);
    console.log(totals);

    // calculate the total patients per month
    const totalPatientsPerMonth = new Map();
    // and calculate the percentage of patients for each race for each month
    const percentageData = []; // grouped data for percentage of each x value

    for (var m = 1; m <= 12; m++) {
        var currMonthTotal = 0;
        for (var r = 1; r <= 6; r++) {
            var key = JSON.stringify({ month: m, race: r });
            currMonthTotal += distribution.get(key);
        }
        totalPatientsPerMonth.set(m, currMonthTotal);

        for (var r = 1; r <= 6; r++) {
            var key = JSON.stringify({ month: m, race: r });
            var cnt = distribution.get(key);
            var percentage = (cnt / currMonthTotal);
            percentageData.push({ month: m, race: r, percentage: percentage });
        }
    }
    console.log(totalPatientsPerMonth);
    console.log(percentageData);

    // Step 1: D3 Line Chart Setup
    var container = d3.select("#chart-container");
    container
        .attr("width", "100%")
        .attr("height", "100%"); // 100% of body size available

    var containerWidth = parseInt(container.style("width"));
    var containerHeight = parseInt(container.style("height"));

    // maintain aspect ratio
    container.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin");

    var svg = d3.select("#chart-container"),
    margin = { top: (0.1 * containerHeight), right: (0.1 * containerWidth), 
                bottom: (0.1 * containerHeight), left: (0.1 * containerWidth) },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
    window["width"] = width;
    window["height"] = height;
    svg.attr("pointer-events", "none");

    //draw space
    var g = svg.append("g")
        .classed("base", true)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add brushing
    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", updateChart);

    //x and y scales
    var xScale = d3.scaleLinear()
        .domain([1, 12])
        .range([0, width]);//.domain(percentageData.map(d => d.month))

    var yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    //append axes
    var xTickLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var formatPercent = d3.format(".0%");

    const xAxis = d3.axisBottom(xScale)
        .tickFormat((d, i) => xTickLabels[i]);

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(formatPercent);

    g.append("g")
        .classed("xAxis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    g.append("g")
        .classed("yAxis", true)
        .call(yAxis);

    //axes labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .text("Month");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", (-height / 2) - margin.top)
        .attr("y", margin.left - 40)
        .attr("text-anchor", "middle")
        .text("Percentage");

    //colors
    var colorScale = d3
        .scaleOrdinal()
        .domain(percentageData.map(d => d.race))
        .range(d3.schemeCategory10);

    //last step: line chart -- go one-by-one (use .stack() in future after preprocessing)
    const raceData1 = percentageData.filter(d => d.race === 1); // returns all entries with race = n
    const raceData2 = percentageData.filter(d => d.race === 2); // ...
    const raceData3 = percentageData.filter(d => d.race === 3);
    const raceData4 = percentageData.filter(d => d.race === 4);
    const raceData5 = percentageData.filter(d => d.race === 5);
    const raceData6 = percentageData.filter(d => d.race === 6);

    var areaGeneratorBegin1 = d3
        .area()
        .x(0)
        .y0(yScale(0))
        .y1(yScale(raceData1[0].percentage));

    var areaGeneratorBegin2 = d3
        .area()
        .x(0)
        .y0(yScale(raceData1[0].percentage))
        .y1(yScale(raceData1[0].percentage + raceData2[0].percentage));

    var areaGeneratorBegin3 = d3
        .area()
        .x(0)
        .y0(yScale(raceData1[0].percentage + raceData2[0].percentage))
        .y1(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage));

    var areaGeneratorBegin4 = d3
        .area()
        .x(0)
        .y0(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage))
        .y1(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage + raceData4[0].percentage));

    var areaGeneratorBegin5 = d3
        .area()
        .x(0)
        .y0(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage + raceData4[0].percentage))
        .y1(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage + raceData4[0].percentage + raceData5[0].percentage));

    var areaGeneratorBegin6 = d3
        .area()
        .x(0)
        .y0(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage + raceData4[0].percentage + raceData5[0].percentage))
        .y1(yScale(raceData1[0].percentage + raceData2[0].percentage + raceData3[0].percentage + raceData4[0].percentage + raceData5[0].percentage + raceData6[0].percentage));

    var areaGenerator1 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(0);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage);
        });

    var areaGenerator2 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(raceData1[i].percentage);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage);
        });
    
    var areaGenerator3 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage);
        });

    var areaGenerator4 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage + raceData4[i].percentage);
        });
        
    var areaGenerator5 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage + raceData4[i].percentage);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage + raceData4[i].percentage + raceData5[i].percentage);
        });

    var areaGenerator6 = d3
        .area()
        .x(d => xScale(d.month))
        .y0((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage + raceData4[i].percentage + raceData5[i].percentage);
        })
        .y1((d, i) => {
            return yScale(raceData1[i].percentage + raceData2[i].percentage + raceData3[i].percentage + raceData4[i].percentage + raceData5[i].percentage + raceData6[i].percentage);
        });

    var animDuration = 5000;
    //race = 1
    g.append("path")
        .classed("a", true)
        .datum(raceData1)
        .attr("fill", colorScale(1))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin1)
        .attr("stroke", colorScale(1))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(1))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator1)
        .attr("stroke", colorScale(1))
        .attr("stroke-width", 2)
        .on("end", function() {
            svg.attr("pointer-events", "all");
            g.append("g").attr("class", "brush").call(brush);
        });
    
    //race = 2
    g.append("path")
        .classed("a", true)
        .datum(raceData2)
        .attr("fill", colorScale(2))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin2)
        .attr("stroke", colorScale(2))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(2))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator2)
        .attr("stroke", colorScale(2))
        .attr("stroke-width", 2);

    //race = 3
    g.append("path")
        .classed("a", true)
        .datum(raceData3)
        .attr("fill", colorScale(3))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin3)
        .attr("stroke", colorScale(3))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(3))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator3)
        .attr("stroke", colorScale(3))
        .attr("stroke-width", 2);

    //race = 4
    g.append("path")
        .classed("a", true)
        .datum(raceData4)
        .attr("fill", colorScale(4))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin4)
        .attr("stroke", colorScale(4))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(4))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator4)
        .attr("stroke", colorScale(4))
        .attr("stroke-width", 2);

    //race = 5
    g.append("path")
        .classed("a", true)
        .datum(raceData5)
        .attr("fill", colorScale(5))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin5)
        .attr("stroke", colorScale(5))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(5))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator5)
        .attr("stroke", colorScale(5))
        .attr("stroke-width", 2);

    //race = 6
    g.append("path")
        .classed("a", true)
        .datum(raceData6)
        .attr("fill", colorScale(6))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGeneratorBegin6)
        .attr("stroke", colorScale(6))
        .attr("stroke-width", 2)
        .transition()
        .duration(animDuration)
        .attr("fill", colorScale(6))
        .attr("fill-opacity", 0.3)
        .attr("d", areaGenerator6)
        .attr("stroke", colorScale(6))
        .attr("stroke-width", 2);

    // set legend (done)
    var legend = svg.append("g")
        .attr("transform", `translate(${margin.left + width - 200}, ${margin.top + height - 300})`);
    
    legend
        .append("rect")
        .classed("legend", true)
        .attr("width", 150)
        .attr("height", 250)
        .style("fill", "white")
        .style("stroke", "black");

    // 1
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(1)}`)
        .attr("transform", `translate(${10}, ${10})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("White")
        .attr("transform", `translate(${35}, ${26})`);

    // 2
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(2)}`)
        .attr("transform", `translate(${10}, ${40})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Black")
        .attr("transform", `translate(${35}, ${56})`);

    // 3
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(3)}`)
        .attr("transform", `translate(${10}, ${70})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Hispanic")
        .attr("transform", `translate(${35}, ${86})`);

    // 4
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(4)}`)
        .attr("transform", `translate(${10}, ${102})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Asian or")
        .attr("transform", `translate(${35}, ${118})`);
    legend
        .append("text")
        .attr("font-size", 14)
        .text("Pacific Islander")
        .attr("transform", `translate(${35}, ${130})`);

    // 5
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(5)}`)
        .attr("transform", `translate(${10}, ${150})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Native American")
        .attr("transform", `translate(${35}, ${166})`);

    // 6
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale(6)}`)
        .attr("transform", `translate(${10}, ${180})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Other")
        .attr("transform", `translate(${35}, ${196})`);

    // Update the chart on boundaries
    var idleTimeout;
    function idled() { idleTimeout = null; }

    function updateChart(event) {
        console.log("zooming");
        
        // What are the selected boundaries?
        console.log(event.selection);
            
        if (event.selection === null) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            xScale.domain([1, 12]);
        } else {
            g.select(".brush").call(brush.move, null); //remove grey box

            var v1 = Math.floor(xScale.invert(event.selection[0]));
            var v2 = Math.floor(xScale.invert(event.selection[1]));
            console.log(v1);
            console.log(v2);

            xScale.domain([v1, v2]);
            console.log(xScale.domain());
            console.log(raceData6.slice(v1 - 1, v2));

            // update axis and area position
            g.select(".xAxis").transition().duration(1000).call(d3.axisBottom(xScale));
            g.selectAll(".a").remove();

            //race = 1
            g.append("path")
                .classed("a", true)
                .datum(raceData1.slice(v1 - 1, v2))
                .attr("d", areaGenerator1)
                .attr("fill", colorScale(1))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(1))
                .attr("stroke-width", 2);    

            //race = 2
            g.append("path")
                .classed("a", true)
                .datum(raceData2.slice(v1 - 1, v2))
                .attr("d", areaGenerator2)
                .attr("fill", colorScale(2))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(2))
                .attr("stroke-width", 2);

            //race = 3
            g.append("path")
                .classed("a", true)
                .datum(raceData3.slice(v1 - 1, v2))
                .attr("d", areaGenerator3)
                .attr("fill", colorScale(3))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(3))
                .attr("stroke-width", 2);

            //race = 4
            g.append("path")
                .classed("a", true)
                .datum(raceData4.slice(v1 - 1, v2))
                .attr("d", areaGenerator4)
                .attr("fill", colorScale(4))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(4))
                .attr("stroke-width", 2);

            //race = 5
            g.append("path")
                .classed("a", true)
                .datum(raceData5.slice(v1 - 1, v2))
                .attr("d", areaGenerator5)
                .attr("fill", colorScale(5))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(5))
                .attr("stroke-width", 2);

            //race = 6
            g.append("path")
                .classed("a", true)
                .datum(raceData6.slice(v1 - 1, v2))
                .attr("d", areaGenerator6)
                .attr("fill", colorScale(6))
                .attr("fill-opacity", 0.3)
                .attr("stroke", colorScale(6))
                .attr("stroke-width", 2);
        }
    }
}

function chart3_annotation1() {
    var w = window["width"];
    var h = window["height"];
    console.log("w: " + w + " h: " + h);

    const annotations = [
        {
            note: {
                label: "Concerning race, the disparity is much larger. The majority of patients in the total 10,000 are white."
            },
            x: (0.1956181533646322 * w),
            y: (0.3571428571428571 * h),
            dy: 0,
            dx: 0
        },
        {
            note: {
                label: "Notice the extremely small percentage of Native American patients that is barely visible."
            },
            x: (0.3716744913928013 * w),
            y: (0.0357142857142857 * h),
            dy: (0.1785714285714286 * h),
            dx: (0.0978090766823161 * w)
        }
    ]
    
    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    d3.select(".base")
        .append("g")
        .classed("annotation-group", true)
        .call(makeAnnotations);
}
