import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Viewport = dynamic(() => import("../components/Viewport"), {
  ssr: false,
});

export default function LabelWorkspace({
  labelKeys,
  jobDescription,
}: {
  labelKeys: string[];
  jobDescription: string;
}) {
  const [activeLabel, setActiveLabel] = useState<string>();

  return (
    <>
      <div className="key-container">
        <div style={{ padding: "20px" }}>Label Keys:</div>
        <ul>
          {labelKeys.map((key, index) => {
            let style = {};
            if (key === activeLabel) {
              style = { backgroundColor: "#cacaca" };
            }

            return (
              <li
                key={index}
                onClick={() => {
                  if (key === activeLabel) {
                    setActiveLabel(undefined);
                  } else {
                    setActiveLabel(key);
                  }
                }}
                style={style}
              >{`${key}`}</li>
            );
          })}
        </ul>
      </div>
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <div style={{ width: "70%", height: "94%", overflow: "hidden" }}>
          <Viewport activeLabel={activeLabel} />
        </div>
        <div id="side-bar" className="side-bar">
          <div className="desc-panel">
            <div className="desc-header">Job Description</div>
            <div className="desc-body">{jobDescription}</div>
          </div>
          <div className="button-container">
            <button>SUBMIT</button>
          </div>
        </div>
      </div>
    </>
  );
}
