let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"

// create legend 
const legend = L.control({position: 'bottomright'});

legend.onAdd = function () {
  let div = L.DomUtil.create('div', 'info legend');
  let depths = [-10, 10, 30, 50, 70, 90];
  let depthColors = [
    '#E59866',
    '#F3FF33',
    '#33FF4F',
    '#3396FF',
    '#B533FF',
    '#FF4933',
    ];
  div.innerHTML = '<h4>Depth Legend</h4>';
  // loop through data 
  for (let i = 0; i < depths.length; i++) {
    console.log(depthColors[i]);
    div.innerHTML +=
        '<i style="background:' + depthColors[i] + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        console.log('legend html created');
        return div;
};

// Create the base layers.
const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

d3.json(url).then(function (data) {
  createFeatures(data.features);

  // create function for the pop-ups
  function createFeatures(earthquakeData) {
      function onEachFeature(feature, layer) {
        let time = new Date(feature.properties.time);
        let formattedTime = (`${time.toLocaleDateString()}: ${time.toLocaleTimeString()}`)
        // pop ups for depth, mag, date and time
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
        <p> Earthquake Magntitude: ${(feature.properties.mag)}</p>
        <p>Depth: ${feature.geometry.coordinates[2]} meters</p>
        <p>Date & Time:${formattedTime}</p>`);
  }
    
  // create function for radius
  function getRadius(depth) {
      let baseRadius = 1.30;
      return baseRadius *Math.pow(1.75, depth);
  }
  // color for depth
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, coordinates) {
      let fillColor;
      let depth = feature.geometry.coordinates[2];
      if(depth >= 90) {
        fillColor = '#FF4933';
      } else if (depth >= 70.0 && depth < 90.0) {
        fillColor = '#B533FF';
      } else if (depth >= 50.0 && depth < 70.0) {
        fillColor = '#3396FF';  
      } else if (depth >= 30.0 && depth < 50.0) {
        fillColor = '#33FF4F';
      } else if (depth >= 10.0 && depth < 30.0) {
        fillColor = '#F3FF33';
      } else if (depth >= -10.0 && depth < 10.0) {
        fillColor = '#E59866';  
      }  else {
        fillColor = '#ffffff';
      }
              
      return L.circleMarker(coordinates, {
        radius: getRadius(feature.properties.mag),
        fillColor: fillColor,
        color: '#000',
        weight: 1,
        opacity: 0.75,
        fillOpacity: 0.75
      });
    },
      onEachFeature: onEachFeature
  });

    createMap(earthquakes);
  }

  function createMap(earthquakes) {
    myMap = L.map('map', {
      center: [
          37, -95
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
    
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
      };
    
    let overlayMaps = {
      "Earthquakes": earthquakes
    };
  
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    legend.addTo(myMap);
    console.log('legend added to map');
  };

});