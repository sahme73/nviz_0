function create_chart_1(data) {
    // Step 0: Scale the SVG
    var container = d3.select("#chart-container");
    container
        .attr("width", "100%")
        .attr("height", "100%");

    var containerWidth = parseInt(container.style("width"));
    var containerHeight = parseInt(container.style("height"));

    // maintain aspect ratio
    container.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin");

    container
        .append("svg")
        .attr("id", "chart")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    // Step 1: Calculate the count of patients and their sex for each age group
    var ageCounts = {};
    var maleCounts = {};
    var femaleCounts = {};
    var otherCounts = {};
    data.forEach(patient => {
        const age = patient.AGE;
        ageCounts[age] = (ageCounts[age] || 0) + 1;
        if (patient.FEMALE == 0) {
            maleCounts[age] = (maleCounts[age] || 0) + 1;
        } else if (patient.FEMALE == 1) {
            femaleCounts[age] = (femaleCounts[age] || 0) + 1;
        } else {
            otherCounts[age] = (otherCounts[age] || 0) + 1;
        }
    });
    
    var ageData = [];
    var ageMaleData = [];
    var ageFemaleData = [];
    var ageOtherData = [];
    for (var age = 0; age <= 90; age++) {
        ageData.push({ age: age, count: ageCounts[age] || 0 });
        ageMaleData.push({ age: age, count: maleCounts[age] || 0, gender: "male" });
        ageFemaleData.push({ age: age, count: femaleCounts[age] || 0, gender: "female" });
        ageOtherData.push({ age: age, count: otherCounts[age] || 0, gender: "other" });
    }
    
    // Step 2: Filter out any undefined values passed by a faulty dataset
    ageData = ageData.filter(d => d.age !== undefined);
    ageMaleData = ageMaleData.filter(d => d.age !== undefined);
    ageFemaleData = ageFemaleData.filter(d => d.age !== undefined);
    ageOtherData = ageOtherData.filter(d => d.age !== undefined);
    
    // Step 3: Establish the border variables used for the chart
    var svg = d3.select("#chart"),
        margin = { top: (0.1 * containerHeight), right: (0.1 * containerWidth), 
                   bottom: (0.1 * containerHeight), left: (0.1 * containerWidth) },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;
        svg.attr("pointer-events", "none");

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
    g.selectAll(".male-bars")
        .data(ageMaleData)
        .enter()
        .append("rect")
        .classed("male-bars", true)
        .attr("x", function(d) { return xScale(d.age.toString()); })
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0) // initial height as 0
        .attr("fill", "steelblue")
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.count); })
        .attr("height", d => height - yScale(d.count))
        .on("end", function() {
            svg.attr("pointer-events", "all");
        });
    g.selectAll(".female-bars")
        .data(ageFemaleData)
        .enter()
        .append("rect")
        .classed("female-bars", true)
        .attr("x", function(d) { return xScale(d.age.toString()); })
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0) // initial height as 0
        .attr("fill", "pink")
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.count + (maleCounts[d.age] || 0)); })
        .attr("height", d => height - yScale(d.count));

    // Step 7: Add hovering tooltips to bars

    // hover lower stack
    g.selectAll(".male-bars")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(200%)");

        var mAge = d.age;
        var mCount = d.count;
        var fCount = -1;
        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                // filter returns the .female-bar objects that meet the conditional
                if (d_.age === d.age) {
                    fCount = d_.count;
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(200%)");

        //test
        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "25%");
        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "25%");
        //test

        const age = mAge.toString();
        const count = mCount + fCount;
        const tooltipGroup = g.append("g")
            .attr("class", "tooltip-group");
        tooltipGroup.append("text")
            .attr("class", "age-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 50)
            .attr("text-anchor", "middle")
            .text(`Age: ${age}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 35)
            .attr("text-anchor", "middle")
            .text(`Total: ${count}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 20)
            .attr("text-anchor", "middle")
            .text(`Male: ${mCount}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 5)
            .attr("text-anchor", "middle")
            .text(`Female: ${fCount}`)
            .style("pointer-events", "none");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");

        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                return d.age === d_.age;
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");

        //test
        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");
        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");
        //test

        g.select(".tooltip-group").remove();
    });

    // hover top stack
    g.selectAll(".female-bars")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(200%)");

        var fAge = d.age;
        var fCount = d.count;
        var mCount = -1;
        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                // filter returns the .female-bar objects that meet the conditional
                if (d_.age === d.age) {
                    mCount = d_.count;
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(200%)");

        //test
        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "25%");
        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "25%");
        //test

        const age = fAge.toString();
        const count = mCount + fCount;
        const tooltipGroup = g.append("g")
            .attr("class", "tooltip-group");
        tooltipGroup.append("text")
            .attr("class", "age-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 50)
            .attr("text-anchor", "middle")
            .text(`Age: ${age}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 35)
            .attr("text-anchor", "middle")
            .text(`Total: ${count}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 20)
            .attr("text-anchor", "middle")
            .text(`Male: ${mCount}`)
            .style("pointer-events", "none");
        tooltipGroup.append("text")
            .attr("class", "patient-text")
            .attr("x", xScale(age) + xScale.bandwidth() / 2)
            .attr("y", yScale(count) - 5)
            .attr("text-anchor", "middle")
            .text(`Female: ${fCount}`)
            .style("pointer-events", "none");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");

        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                return d.age === d_.age;
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");

        //test
        g.selectAll(".male-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");
        g.selectAll(".female-bars")
            .filter(function(d_, i_) {
                if (d_.age !== d.age) {
                    return true;
                }
            })
            .transition()
            .duration(200)
            .attr("opacity", "100%")
            .attr("filter", "saturate(100%)");
        //test

        g.select(".tooltip-group").remove();
    });

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