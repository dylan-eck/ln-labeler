import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import OpenSeadragon from "openseadragon";
import * as Annotorious from "@recogito/annotorious-openseadragon";
import "@recogito/annotorious/dist/annotorious.min.css";

export default function Viewport({
  activeLabel,
  setSubmissionData,
}: {
  activeLabel: string | undefined;
  setSubmissionData: any;
}) {
  const [anno, setAnno] = useState<any>();
  const [tool, setTool] = useState<string>("rect");
  const [labels, setLabels] = useState<any>({});
  const [createdAnnotation, setCreatedAnnotation] = useState<any>();

  useEffect(() => {
    if (!labels) return;
    setSubmissionData(labels);
  }, [labels, setSubmissionData]);

  useEffect(() => {
    if (!activeLabel) {
      if (anno) {
        anno.setVisible(false);
      }
      return;
    }

    if (!anno) return;
    anno.clearAnnotations();

    if (labels[activeLabel]) {
      labels[activeLabel].map((label: any) => {
        anno.addAnnotation(label);
      });
    }

    anno.setVisible(true);
  }, [anno, activeLabel, labels]);

  const toggleTool = () => {
    if (tool === "rect") {
      setTool("polygon");
      anno.setDrawingTool("polygon");
    } else {
      setTool("rect");
      anno.setDrawingTool("rect");
    }
  };

  useEffect(() => {
    if (!createdAnnotation || !activeLabel) return;

    if (!labels[activeLabel]) {
      setLabels((prev: any) => ({
        ...prev,
        [activeLabel]: [Object.assign({}, createdAnnotation)],
      }));
    } else {
      setLabels((prev: any) => {
        let next = Object.assign({}, prev);
        next[activeLabel] = [
          ...prev[activeLabel],
          Object.assign({}, createdAnnotation),
        ];
        return next;
      });
    }
    setCreatedAnnotation(undefined);
  }, [createdAnnotation, activeLabel, labels]);

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

    var an = Annotorious(viewer, { widgets: ["COMMENT"] });

    an.setVisible(false);

    an.on("createAnnotation", (annotation: any) =>
      setCreatedAnnotation(annotation)
    );

    setAnno(an);
    return () => {
      an.destroy();
    };
  }, []);

  return (
    <>
      <button className="tool-button" onClick={toggleTool}>
        SELECTION MODE: {tool === "rect" ? "RECTANGLE" : "POLYGON"}
      </button>
      <div id="openseadragon" style={{ width: "100%", height: "100%" }}></div>
    </>
  );
}
