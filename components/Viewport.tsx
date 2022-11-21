import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import "@recogito/annotorious/dist/annotorious.min.css";

export default function Viewport() {
  useEffect(() => {
    let viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "/openseadragon/",
      tileSources: {
        type: "image",
        url: "/sample-image-0.jpg",
      },
      panHorizontal: false,
      panVertical: false,
      defaultZoomLevel: 1,
      minZoomLevel: 1,
      maxZoomLevel: 1,
      showNavigationControl: false,
    });

    var anno = Annotorious(viewer, {});
  }, []);

  return <div id="openseadragon" className="viewport"></div>;
}
