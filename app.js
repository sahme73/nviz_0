window.data = null;
window.data_status = "Data Missing (Loading...)";
window.chart_number = 8; // reset to 1
window.chart_list = [0, 1, 11, 2, 22, 3, 33, 4, 44, 5, 55, 6];
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

        // modify displayed chart
        update_chart();
    }
}

function next_chart() {
    var curr_chart_num = getGlobalStatus("chart_number");

    if (curr_chart_num != 11) {
        // update chart number
        setGlobalStatus("chart_number", getGlobalStatus("chart_number") + 1);

        // modify displayed chart
        update_chart();
    }
}

function force(n) {
    // update chart number
    if (n == 1) {
        setGlobalStatus("chart_number", 1);
    } else if (n == 2) {
        setGlobalStatus("chart_number", 3);
    } else if (n == 3) {
        setGlobalStatus("chart_number", 5);
    } else if (n == 4) {
        setGlobalStatus("chart_number", 7);
    } else if (n == 5) {
        setGlobalStatus("chart_number", 9);
    } else if (n == 6) {
        setGlobalStatus("chart_number", 11);
    }
    
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
    var curr_chart_num = getGlobalStatus("chart_number");
    var curr_chart_list = getGlobalStatus("chart_list");
    var curr_chart = curr_chart_list[curr_chart_num];
    console.log("curr_chart is: " + curr_chart);

    // first update the global annotation
    if (curr_chart <= 6) {
        document.getElementById("global-annotation").innerText = getGlobalStatus("global_annotations").get(curr_chart);
    }

    // update chart number
    if (curr_chart != 6 && curr_chart != 11 && curr_chart != 22 && curr_chart != 33 && curr_chart != 44 && curr_chart != 55) {
        document.getElementById("b4").innerText = "Current Chart: " + curr_chart;
    } else if (curr_chart == 6) {
        document.getElementById("b4").innerText = "Conclusion";
    }

    // clear the current chart
    d3.select("#chart-container")
        .selectAll("*").remove();
    d3.selectAll(".annotation-group")
        .remove();

    // build the current chart
    var data = getGlobalStatus("data");

    if (curr_chart == 1) {
        create_chart_1(data);
    } else if (curr_chart == 11) {
        create_chart_1(data);
        chart1_annotation1();
    } else if (curr_chart == 2) {
        create_chart_2(data);
    } else if (curr_chart == 22) {
        create_chart_2(data);
        chart2_annotation1();
    } else if (curr_chart == 3) {
        create_chart_3(data);
    } else if (curr_chart == 33) {
        create_chart_3(data);
        chart3_annotation1();
    } else if (curr_chart == 4) {
        create_chart_4(data);
    } else if (curr_chart == 44) {
        create_chart_4(data);
        chart4_annotation1();
    }  else if (curr_chart == 5) {
        create_chart_5(data);
    }  else if (curr_chart == 55) {
        create_chart_5(data);
        chart5_annotation1();
    } 
}

async function init() {
    // create basic main annotations per chart
    const global_annotations = new Map();
    global_annotations.set(1, "The following data is on a random sample of 10,000 hospital patients from across the United States of America in 2019. Delve into the charts to begin analyzing the demographics of the patients and focus on the sex, age, and race.");
    global_annotations.set(2, "The total distribution of patient biological sex for all ages combined.");
    global_annotations.set(3, "The chart below highlights the race distribution among the hospital patients throughout 2019.");
    global_annotations.set(4, "Now that we know the patient demographics, begin analyzing patients with that were hospitalized with strokes with varying severity.");
    global_annotations.set(5, "Race is another possible factor that needs to be analyzed with respect to strokes and how severe they are.");
    global_annotations.set(6, "Conclusion: Although the analysis conducted on the graphs emphasizes that the sample selection of 10,000 patients is biased in favor of white patients, the closer distribution of sexes gives some insight into whether or not biological sex heavily influences the severity of a stroke. The evident outcome, however, is that older patients have a much higher risk of having a stroke. Biological sex played some factor in the severity, as more males had more severe hospitalization cases at younger ages. Again, to better conclude a racial analysis, the sample of patients needs equaler distribution of races for proper analysis.");

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