window.data = null;
window.data_status = "Data Missing (Loading...)";
window.chart_number = 1;
window.global_annotations = null;

function getGlobalStatus(key) {
    return window[key];
}

function setGlobalStatus(key, value) {
    window[key] = value;
}

function msg() {
    alert(getGlobalStatus("data_status"));
}

function prev_chart() {
    var curr_chart_num = getGlobalStatus("chart_number");
    if (curr_chart_num != 1) {
        // update chart number
        setGlobalStatus("chart_number", getGlobalStatus("chart_number") - 1);
        document.getElementById("b4").innerText = "Current Chart: " + getGlobalStatus("chart_number");

        // modify displayed chart
        update_chart();
    }
}

function next_chart() {
    var curr_chart_num = getGlobalStatus("chart_number");
    if (curr_chart_num != 5) {
        // update chart number
        setGlobalStatus("chart_number", getGlobalStatus("chart_number") + 1);
        document.getElementById("b4").innerText = "Current Chart: " + getGlobalStatus("chart_number");

        // modify displayed chart
        update_chart();
    }
}

function force(n) {
    // update chart number
    setGlobalStatus("chart_number", n);
    document.getElementById("b4").innerText = "Current Chart: " + n;
    update_chart();
}

function enable_force() {
    elements = document.getElementsByClassName("force");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.pointerEvents="all";
        elements[i].style.opacity="100%";
    }
}

function update_chart() {
    // first update the global annotation
    document.getElementById("global-annotation").innerText = getGlobalStatus("global_annotations").get(getGlobalStatus("chart_number"));

    // clear the current chart
    d3.select("#chart-container")
        .selectAll("*").remove();

    // build the current chart
    var data = getGlobalStatus("data");
    var curr_chart_num = getGlobalStatus("chart_number");

    if (curr_chart_num == 1) {
        create_chart_1(data);
    } else if (curr_chart_num == 2) {
        create_chart_2(data);
    }
}

async function init() {
    // create basic main annotations per chart
    const global_annotations = new Map();
    global_annotations.set(1, "The following data is on a random sample of 10,000 hospital patients from across the United States of America in 2019.");
    global_annotations.set(2, "The chart below highlights the race distribution among the hospital patients throughout 2019.");
    global_annotations.set(3, "The total distribution of patient sex.");
    global_annotations.set(4, "Now that we know the patient demographics, begin analyzing patients with stroke appointments.");

    setGlobalStatus("global_annotations", global_annotations);

    // check if d3 dependency met
    console.log(d3);

    // load the data
    document.getElementById("b1").innerText = getGlobalStatus("data_status");
    console.log("Loading data...");
    var load_start = Date.now();
    const data = await d3.csv("10k_sample.csv");
    var load_end = Date.now();
    if (data) {
        console.log("Data loaded!");
        setGlobalStatus("data_status", "Data Loaded");
    } else {
        console.log("Data empty!")
        setGlobalStatus("data_status", "Data Failed");
    }
    document.getElementById("b1").innerText = `${getGlobalStatus("data_status")} (${(load_end - load_start)/1000} seconds)`;

    // verify that the data is loaded properly
    console.log(data);

    // store the data globally
    setGlobalStatus("data", data);

    // enable force buttons
    enable_force();

    // update
    update_chart();
}

function create_chart_1(data) {
    // Step 0: Scale the SVG
    var container = d3.select("#chart-container");
    container
        .attr("width", "100%")
        .attr("height", "100%");

    var containerWidth = parseInt(container.style("width"));
    var containerHeight = parseInt(container.style("height"));

    container
        .append("svg")
        .attr("id", "chart")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

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
        margin = { top: (0.1 * containerHeight), right: (0.1 * containerWidth), 
                   bottom: (0.1 * containerHeight), left: (0.1 * containerWidth) },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

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
        .attr("class", "tick")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    g.append("g")
        .attr("class", "tick")
        .call(yAxis);

    // Step 9: Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .text("Age");

    // Step 10: Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", (-height / 2) - margin.top)
        .attr("y", margin.left - 40)
        .attr("text-anchor", "middle")
        .text("Number of Patients");
}

function create_chart_2(data) {
    // Step 0: Scale the SVG
    var container = d3.select("#chart-container");
    container
        .attr("width", "100%")
        .attr("height", "100%");

    var containerWidth = parseInt(container.style("width"));
    var containerHeight = parseInt(container.style("height"));

    container
        .append("svg")
        .attr("id", "chart")
        .attr("width", containerWidth)
        .attr("height", containerHeight);
}