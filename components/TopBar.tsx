import Image from "next/image";

export default function TopBar({ onClick }: { onClick: any }) {
  return (
    <div className="top-bar">
      <div className="logo">
        <Image
          src="/ln-logo.png"
          width="638"
          height="638"
          alt="Labeler NearBy logo"
        />
        <div>Labeler NearBy</div>
      </div>
      <button className="signout-button" onClick={onClick}>
        SIGN OUT
      </button>
    </div>
  );
}
