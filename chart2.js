// this will be a bar chart of male vs females with https://jsfiddle.net/amp42fjn/ as a reference
function create_chart_2(data) {
    var overall = 0;
    var totals = [0, 0, 0]; // male | female | other
    data.forEach(patient => {
        if (patient.FEMALE == 0) {
            totals[0] += 1;
            overall++;
        } else if (patient.FEMALE == 1) {
            totals[1] += 1;
            overall++;
        } else {
            totals[2] += 1;
            overall++;
        }
    });
    
    //
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
    margin = { top: (0.5 * containerHeight), right: (0.1 * containerWidth), 
                bottom: (0.1 * containerHeight), left: (0.5 * containerWidth) };

    //draw space
    var g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //graph
    var pie = d3.pie();
    oRadius = containerHeight * 0.35;
    iRadius = containerHeight * 0.25;
    arc = d3.arc()
        .innerRadius(iRadius)
        .outerRadius(oRadius);
    arcs = g.selectAll("arc")
        .data(pie(totals))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", function(d) {
            return arc(d);
        });

    var colors = ["steelblue", "pink"];
    path = d3.selectAll("path")
        .style("stroke", "black")
        .style("fill", function(d, i) {
            return colors[i];
        });

    // inspired by: https://jsfiddle.net/amp42fjn/ | Nusrath
    var tooltip = d3.select("body")
        .append("div")
        .style("display", "inline")
        .style("position", "fixed")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    path.on("mouseover", function(event, d) {
        d3.select(this).attr("d", function(d) {
            return d3.arc().innerRadius(iRadius * 0.95)
                    .outerRadius(oRadius * 1.05)(d);
        })
        tooltip.style("visibility", "visible")
            .style("top", (event.pageY - 28) + "px")
            .style("left", (event.pageX) + "px");
    })
    .on("mousemove", function(event, d) {
        //tooltip
        tooltip.style("top", (event.pageY - 28) + "px")
            .style("left", (event.pageX) + "px");
        tooltip.text(`${d.value / overall * 100}%`);
        console.log(d.value / overall);
    })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("d", function(d) {
            return d3.arc().innerRadius(iRadius)
                    .outerRadius(oRadius)(d);
        });
        tooltip.style("visibility", "hidden");
    });

    /**
     * @TODO
     * -Add tooltip
     * -Add title to middle of chart 2
     * -Add legend to chart 1 and 2
     */
}