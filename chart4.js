window.width = 0;
window.height = 0;

// inspired by: https://observablehq.com/@d3/density-contours?intent=fork
function create_chart_4(data) {
    // Data preprocessing
    // CIR021, CIR022, CIR024, CIR025
    var total = 0;
    var strokePatientsSeverity = [];
    data.forEach(patientInfo => {
        if (patientInfo.DXCCSR_CIR021 != 0 ||
            patientInfo.DXCCSR_CIR022 != 0 ||
            patientInfo.DXCCSR_CIR024 != 0 ||
            patientInfo.DXCCSR_CIR025 != 0) {
            total += 1;
            strokePatientsSeverity.push({ age: parseInt(patientInfo.AGE), aprdrg: parseInt(patientInfo.APRDRG), sex: parseInt(patientInfo.FEMALE) });
        }
    });
    // APR: all patient refined
    // DRG: diagnosis related group severity
    console.log(strokePatientsSeverity);

    // Chart container setup
    var container = d3.select("#chart-container");
    container.attr("width", "100%")
        .attr("height", "100%");
    var containerWidth = parseInt(container.style("width"));
    var containerHeight = parseInt(container.style("height"));

    // Maintain aspect ratio
    container.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin");

    var svg = d3.select("#chart-container"),
    margin = { top: (0.1 * containerHeight), right: (0.1 * containerWidth), 
                bottom: (0.1 * containerHeight), left: (0.1 * containerWidth) },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
    window["width"] = width;
    window["height"] = height;

    // Draw space
    var g = svg.append("g")
        .classed("base", true)
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create the horizontal and vertical scales
    var x = d3.scaleLinear()
        .domain(d3.extent(strokePatientsSeverity, d => d.age)).nice()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(strokePatientsSeverity, d => d.aprdrg)).nice()
        .rangeRound([height, 0]);

    // Compute the density contours
    var contours = d3.contourDensity()
        .x(d => x(d.age))
        .y(d => y(d.aprdrg))
        .size([width, height])
        .bandwidth(30)
        .thresholds(30)
    (strokePatientsSeverity);

    // Append the axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    g.append("g")
        .call(yAxis);

    // Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .text("Age");

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", (-height / 2) - margin.top)
        .attr("y", margin.left - 40)
        .attr("text-anchor", "middle")
        .text("Severity Rating");

    // Append the contours
    g.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
        .selectAll()
        .data(contours)
        .join("path")
            .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
            .attr("d", d3.geoPath());

    // Append the dots
    var colorScale = ["steelblue", "pink"]; // consistent

    var dots = g.append("g")
            .attr("stroke", "white")
        .selectAll()
        .data(strokePatientsSeverity)
        .join("circle")
            .attr("cx", d => x(d.age))
            .attr("cy", d => y(d.aprdrg))
            .attr("r", 3.2)
            .attr("fill", d => colorScale[d.sex]);

    // tooltip
    var tooltip = d3.select("body")
        .append("div")
        .style("display", "inline")
        .style("position", "fixed")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("");

    dots
        .on("mouseover", function(event, d) {
            if (d != null) {
                if (d.sex == 0) {
                    tooltip.html(`Sex: Male <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.sex == 1) {
                    tooltip.html(`Sex: Female <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                }
            }

            tooltip
            .style("visibility", "visible")
            .style("top", (event.pageY - 64) + "px")
            .style("left", (event.pageX) + "px");
        })
        .on("mousemove", function(event, d) {
            tooltip
                .style("top", (event.pageY - 64) + "px")
                .style("left", (event.pageX) + "px");
        })
        .on("mouseout", function(event, d) {
            tooltip.style("visibility", "hidden");
        });

    // legend
    var legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 50}, ${margin.top + 50})`);

    legend
        .append("rect")
        .classed("legend", true)
        .attr("width", 150)
        .attr("height", 100)
        .style("fill", "white") // adjust
        .style("stroke", "black");

    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "steelblue")
        .attr("transform", `translate(${10}, ${10})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Male")
        .attr("transform", `translate(${35}, ${26})`);

    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "pink")
        .attr("transform", `translate(${10}, ${40})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Female")
        .attr("transform", `translate(${35}, ${56})`);
}

function chart4_annotation1() {
    var w = window["width"];
    var h = window["height"];

    const annotations = [
        {
            note: {
                label: "The outliers outside the contoured section of the graph indicate that strokes can still affect younger patients."
            },
            x: (0.0978090766823161 * w),
            y: (0.4464285714285714 * h),
            dy: 0,
            dx: 0
        },
        {
            note: {
                label: "A noteworthy cluster is this group of males between ages 50 and 70 with more severe stroke hospitalizations."
            },
            x: (0.6455399061032864 * w),
            y: (0.2678571428571429 * h),
            dy: (0.0892857142857143 * h),
            dx: (-0.2151799687010955 * w)
        }
    ]
    
    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    d3.select(".base")
        .append("g")
        .classed("annotation-group", true)
        .call(makeAnnotations);
}