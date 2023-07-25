window.data = null;
window.data_status = "Data Missing (Loading...)";
window.chart_number = 1; // reset to 1
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
    } else if (curr_chart_num == 3) {
        create_chart_3(data);
    }
}

async function init() {
    // create basic main annotations per chart
    const global_annotations = new Map();
    global_annotations.set(1, "The following data is on a random sample of 10,000 hospital patients from across the United States of America in 2019.");
    global_annotations.set(2, "The total distribution of patient sex.");
    global_annotations.set(3, "The chart below highlights the race distribution among the hospital patients throughout 2019.");
    global_annotations.set(4, "Now that we know the patient demographics, begin analyzing patients with stroke appointments.");

    setGlobalStatus("global_annotations", global_annotations);
    document.getElementById("global-annotation").innerText = getGlobalStatus("global_annotations").get(getGlobalStatus("chart_number"));

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