import React, { useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import buildings from './assets/historic-buildings.json';
import buildingIcon from './assets/historic-building.png';

declare const AMap: any;

const App = () => {
  const amap = useRef<any>();

  useEffect(() => {
    const icon = {
      type: "image",
      image: buildingIcon,
      size: [36, 36],
      anchor: 'center',
    }
    const textStyle = {
      fontSize: 14,
      fontWeight: '800',
      fillColor: '#aa381e',
      strokeColor: '#fff',
      strokeWidth: 2,
      fold: true,
      padding: '2, 5',
    }
    const labels = buildings.map(building => ({
      name: building.name,
      position: [building.latitude, building.longitude],
      zooms: [10, 20],
      opacity: 1,
      zIndex: 10,
      fold: true,
      icon,
      text: {
        content: building.name,
        direction: 'right',
        offset: [2, -3],
        style: textStyle,
      },
    }));

    AMapLoader.load({
      key: "2cf11fdcaf5bb33e75a2175100db738b",
      version: "2.0",
      plugins: [],
    })
      .then((AMap) => {
        const map = new AMap.Map("container", {
          viewMode: "2D",
          zoom: 10,
          center: [112.549656,37.870451],
          pitch: 0,
        });
        const layer = new AMap.LabelsLayer({
          zooms: [0, 100],
          zIndex: 1000,
          allowCollision: false,
        });
        map.add(layer)
        const markers = labels.map((label, i) => new AMap.LabelMarker({...label, index: i}));
        layer.add(markers);
        
        amap.current = map;
      })

    return () => {
      amap.current && amap.current.destroy();
    };
  }, []);

  return <div id="container"></div>;
};

export default App;
