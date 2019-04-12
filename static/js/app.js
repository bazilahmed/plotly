function buildMetadata(sample) {
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample)
  .then(sampleMetadata => {
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadataTag = d3.select("#sample-metadata");
    
    // Use `.html("") to clear any existing metadata
    metadataTag.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(sampleMetadata).forEach(([key, value]) => {
      metadataTag
        .append('p')
        .text(key + " : " + value);
    });
  });

}

function buildCharts(sample) {
    // Use d3.json to fetch the sample data from the hosted sample/<sample> api 
    d3.json("/samples/" + sample).then(sampleData => {

      // Build a Pie Chart for top 10 sample values
      // Make a key value pair from the sampleData for each sample value
      var sampleDataReformat = [];

      // Iterate over each sample value and make key value pairs and add it to the empty array
      for (let i=0; i< sampleData.otu_ids.length; i++) {
        let singleOtu = {
          'otu_id': sampleData.otu_ids[i],
          'otu_label': sampleData.otu_labels[i],
          'sample_value': sampleData.sample_values[i]
        };

        sampleDataReformat.push(singleOtu);
     
      };

      // Sort the data to slice it
      sampleDataReformat.sort(function(a, b) {
        return parseFloat(b.sample_value) - parseFloat(a.sample_value);
      });
      
      // Slice the dataset to get the top 10 values based on sample_value
      var slicedSampleData = sampleDataReformat.slice(0, 10);

      // Build the trace for the Pie chart
      var trace2 = {
        labels: slicedSampleData.map(row => row.otu_id),
        values: slicedSampleData.map(row => row.sample_value),
        text: slicedSampleData.map(row => row.otu_label),
        textinfo: 'percent',
        type: 'pie',
        hoverinfo: 'label+text+value+percent'
      };
   
      // Create the data array 
      var data2 = [trace2];

      // Create the layout object 
      var layout2 = {
        title: 'Top 10 Sample Values'
      };


      // Plot the pie chart using Plotly.js
      Plotly.newPlot("pie", data2, layout2);

      /////////////////////////////////////////
      // Build a Bubble Chart
      // Create a trace to use in bubble chart
      var trace1 = {
        x: sampleData.otu_ids,
        y: sampleData.sample_values,
        text: sampleData.otu_labels,        
        mode: 'markers',
        marker: { 
          // Define size, color range, color scale
          size:  sampleData.sample_values,
          color: sampleData.otu_ids,
          colorscale: 'Rainbow'
        },
        // Select the hoverinfo to show all the values i.e. x, y and text labels
        hoverinfo: "x+y+text"
      };

      // Create the data variable for bubble chart
      var data1 = [trace1];

      // Create the layout variable for bubble chart
      var layout1 = {
        hovermode: 'closest',
        title:'Bubble Chart',
        xaxis: { title: "OTU ID"},
        yaxis: { title: "Sample Value" }
      };

      // Plot the chart using Plotly.js 
      Plotly.newPlot("bubble", data1, layout1);

    });
}

/////////////////////////////////////////////////////////////
// Build the Gauge 
function buildGuage(sample) {

  // Use d3.json to fetch the sample data from the hosted sample/<sample> api 
  d3.json("/metadata/" + sample).then(sampleData => {
    var level = sampleData.WFREQ;

    // Trig to calc meter point
    var degrees = 9 - level,
    radius = .5;

    var radians = degrees * Math.PI / 9;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'scrubbing freq',
        text: level,
        hoverinfo: 'text+name'},
      { values:  [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                            'rgba(210, 206, 145, .5)', 
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: 'Belly Button Washing Frequency<br>Scrubs per Week',
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);

  });
}



// Initialization function 
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGuage(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGuage(newSample);
}

// Initialize the dashboard
init();
