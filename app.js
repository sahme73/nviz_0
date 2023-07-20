window.data_status = "data missing";

function getGlobalStatus(key) {
    return window[key];
}

function setGlobalStatus(key, value) {
    window[key] = value;
}

function msg() {
    alert(getGlobalStatus("data_status"));
}

async function init() {
    // check if d3 dependency met
    console.log(d3);

    // load the data
    document.getElementById("b1").innerText = getGlobalStatus("data_status");
    console.log("loading data...");
    var load_start = Date.now();
    const data = await d3.csv("10k_sample.csv");
    var load_end = Date.now();
    if (data) {
        console.log("data loaded!");
        setGlobalStatus("data_status", "data loaded");
    } else {
        console.log("data empty!")
        setGlobalStatus("data_status", "data failed");
    }
    document.getElementById("b1").innerText = `${getGlobalStatus("data_status")} (${(load_end - load_start)/1000} seconds)`;

    // verify that the data is loaded properly
    console.log(data);

    /* basic bar chart (grouping patients by age) */
    create_chart_1(data);
}

function create_chart_1(data) {
    // Step 1: Calculate the count of patients for each age group
    var ageCounts = {};
    data.forEach(patient => {
        const age = patient.AGE;
        ageCounts[age] = (ageCounts[age] || 0) + 1;
    });
    
    var ageData = [];
    for (var age = 0; age <= 90; age++) {
        ageData.push({ age: age, count: ageCounts[age] || 0 });
    }
    
    // Step 2: Filter out any undefined values passed by a faulty dataset
    ageData = ageData.filter(d => d.age !== undefined);
    
    // Step 3: Establish the variables used for the chart
    var svg = d3.select("#chart"),
        margin = { top: 50, right: 50, bottom: 70, left: 70 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // Step 4: Build the x and y axes scales
    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(ageData.map(d => d.age.toString()))
        .padding(0.4);
    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(ageData, d => d.count)]);

    // Step 5: Create the plane where the rendering of the bars takes place at margin
    var g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Step 6: Add bars to chart based on age data
    g.selectAll("rect")
        .data(ageData)
        .enter()
        .append("rect")
        .attr("x", function(d) { return xScale(d.age.toString()); })
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0) // initial height as 0
        .attr("fill", "steelblue")
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d.count))
        .attr("height", d => height - yScale(d.count));
    
    // Step 7: Add hovering tooltips to bars
    g.selectAll("rect")
    .on("mouseover", function(event, d) {
        d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "orange");
        const age = d.age.toString();
        const count = d.count;
        const tooltipGroup = g.append("g")
            .attr("class", "tooltip-group");
        tooltipGroup.append("text")
            .attr("class", "age-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 20)
            .attr("text-anchor", "middle")
            .text(`Age: ${age}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 5)
            .attr("text-anchor", "middle")
            .text(`Patients: ${count}`)
            .style("pointer-events", "none");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "steelblue");
        g.select(".tooltip-group").remove();
    });

    console.log(ageData);

    // Step 8: Add x-axis and y-axis
    const xAxis = d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter((d, i) => i % 5 === 0));
    const yAxis = d3.axisLeft(yScale);

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    g.append("g")
        .call(yAxis);

    // Step 9: Add x-axis label
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .text("Age");

    // Step 10: Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (-height / 2) - margin.top)
        .attr("y", margin.left - 40)
        .attr("text-anchor", "middle")
        .text("Number of Patients");
}