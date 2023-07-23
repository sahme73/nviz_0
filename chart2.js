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