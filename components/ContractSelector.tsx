import { useRef } from "react";

export default function ContractSelector({
  validator,
  setter,
}: {
  validator: (contractId: string) => Promise<boolean>;
  setter: any;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputRef.current) {
        const id = inputRef.current.value;
        validator(id).then((isValid: boolean) => {
          console.log(`contract valid?: ${isValid}`);
          if (isValid) {
            setter(id);
          }
        });
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
