import dynamic from "next/dynamic";

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
  return (
    <>
      <div style={{ width: "100%", height: "100%" }}>
        <div className="key-container">
          <div style={{ padding: "20px" }}>Label Keys:</div>
          <ul>
            {labelKeys.map((key, index) => {
              return <li key={index}>{`${key}`}</li>;
            })}
          </ul>
        </div>
        <Viewport />
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
    </>
  );
}
