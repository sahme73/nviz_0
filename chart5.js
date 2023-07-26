// inspired by: https://observablehq.com/@d3/density-contours?intent=fork
function create_chart_5(data) {
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
            strokePatientsSeverity.push({ age: parseInt(patientInfo.AGE), aprdrg: parseInt(patientInfo.APRDRG), race: parseInt(patientInfo.RACE) });
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

    // Draw space
    var g = svg.append("g")
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
    var colorScale = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]; // consistent

    var dots = g.append("g")
            .attr("stroke", "white")
        .selectAll()
        .data(strokePatientsSeverity)
        .join("circle")
            .attr("cx", d => x(d.age))
            .attr("cy", d => y(d.aprdrg))
            .attr("r", 3.2)
            .attr("fill", d => colorScale[d.race - 1]);

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
                if (d.race == 1) {
                    tooltip.html(`Race: White <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.race == 2) {
                    tooltip.html(`Race: Black <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.race == 3) {
                    tooltip.html(`Race: Hispanic <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.race == 4) {
                    tooltip.html(`Race: Asian or Pacific Islander <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.race == 5) {
                    tooltip.html(`Race: Native American <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
                } else if (d.race == 6) {
                    tooltip.html(`Race: Other <br> Severity: ${d.aprdrg} <br> Age: ${d.age}`);
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
        .attr("height", 250)
        .style("fill", "white")
        .style("stroke", "black");

    // 1
    legend
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", `${colorScale[0]}`)
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
        .style("fill", `${colorScale[1]}`)
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
        .style("fill", `${colorScale[2]}`)
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
        .style("fill", `${colorScale[3]}`)
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
        .style("fill", `${colorScale[4]}`)
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
        .style("fill", `${colorScale[5]}`)
        .attr("transform", `translate(${10}, ${180})`);

    legend
        .append("text")
        .attr("font-size", 14)
        .text("Other")
        .attr("transform", `translate(${35}, ${196})`);
}