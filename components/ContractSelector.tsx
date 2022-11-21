import { useRef } from "react";

export default function ContractSelector({ setter }: { setter: any }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputRef.current) {
        const id = inputRef.current.value;
        setter(id);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "80vh",
      }}
    >
      <div>Enter a smart contract account name to request a task:</div>
      <input type="text" onKeyDown={handleKeyDown} ref={inputRef}></input>
    </div>
  );
}
