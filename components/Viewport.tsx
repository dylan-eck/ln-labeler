import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import "@recogito/annotorious/dist/annotorious.min.css";

export default function Viewport() {
  const [labels, setLabels] = useState<any>([]);

  useEffect(() => {
    let viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "/openseadragon/",
      tileSources: {
        type: "image",
        url: "/sample-image-0.jpg",
      },
      // panHorizontal: false,
      // panVertical: false,
      // defaultZoomLevel: 1,
      // minZoomLevel: 1,
      // maxZoomLevel: 1,
      showNavigationControl: false,
    });

    var anno = Annotorious(viewer, {});

    anno.on("createAnnotation", (annotation: any) => {
      setLabels(() => [...labels, annotation]);
      console.log(`created new label: ${annotation.id}`);
      console.log(annotation);
    });

    anno.on("updateAnnotation", (annotation: any) => {
      setLabels(() => {
        const toUpdate = labels.findIndex(
          (label: any) => label.id === annotation.id
        );
        labels[toUpdate] = annotation;
        return labels;
      });
      console.log(`updated label: ${annotation.id}`);
    });

    anno.on("deleteAnnotation", (annotation: any) => {
      setLabels(() =>
        labels.filter((label: any) => {
          label.id != annotation.id;
        })
      );
      console.log(`deleted label: ${annotation.id}`);
    });
  }, [labels]);

  return (
    <div id="openseadragon" style={{ width: "100%", height: "94%" }}></div>
  );
}
