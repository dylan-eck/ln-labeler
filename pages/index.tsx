import { useState, useEffect, useCallback } from "react";
import {
  Near,
  keyStores,
  connect,
  ConnectConfig,
  Account,
  utils,
} from "near-api-js";
import { setupModal } from "@near-wallet-selector/modal-ui";
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png";
import {
  setupWalletSelector,
  Wallet,
  WalletSelector,
} from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import "@near-wallet-selector/modal-ui/styles.css";
import axios from "axios";
import { css } from "@emotion/react";
import Image from "next/image";

const MARKER_RADIUS = 10;

interface Point {
  x: number;
  y: number;
}

export default function Home() {
  // const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  // const [context, setContext] = useState<CanvasRenderingContext2D>();
  // const [points, setPoints] = useState<Point[]>([]);

  // useEffect(() => {
  //   if (canvas && context) return;

  //   const canvasElement = document.getElementById(
  //     "viewport"
  //   ) as HTMLCanvasElement;
  //   if (!canvasElement) return;

  //   const graphicsContext = canvasElement.getContext("2d");
  //   if (!graphicsContext) return;

  //   setCanvas(canvasElement);
  //   setContext(graphicsContext);
  // }, [canvas, context]);

  // const clearRegion = () => {
  //   if (!canvas || !context) return;
  //   context.clearRect(0, 0, canvas.width, canvas.height);
  //   setPoints(() => []);
  // };

  // useEffect(() => {
  //   if (!canvas || !context || !points.length) return;

  //   context.clearRect(0, 0, canvas.width, canvas.height);

  //   context.strokeStyle = "#00FF00";
  //   context.fillStyle = "rgba(0, 255, 0, 0.5)";

  //   let closed = false;
  //   if (points.length >= 1) {
  //     const start = points[0];
  //     const end = points[points.length - 1];

  //     const dist = Math.sqrt(
  //       Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  //     );
  //     if (dist < MARKER_RADIUS) {
  //       points[points.length - 1] = points[0];
  //       console.log();
  //       closed = true;
  //     }
  //   }

  //   points.map((point: Point) => {
  //     context.setLineDash([4, 4]);
  //     context.beginPath();
  //     context.arc(point.x, point.y, MARKER_RADIUS, 0, 2 * Math.PI);
  //     context.stroke();
  //   });

  //   context.setLineDash([]);
  //   context.beginPath();
  //   context.moveTo(points[0].x, points[0].y);
  //   for (let i = 1; i < points.length; i++) {
  //     context.lineTo(points[i].x, points[i].y);
  //   }
  //   context.stroke();
  //   if (closed) {
  //     context.fill();
  //   }
  // }, [canvas, context, points]);

  // const handleClick = useCallback((event: any) => {
  //   const bounds = event.target.getBoundingClientRect();
  //   let clickPos = {
  //     x: Math.round(event.clientX - bounds.left),
  //     y: Math.round(event.clientY - bounds.top),
  //   };
  //   setPoints((points) => [...points, clickPos]);
  // }, []);

  // return (
  //   <div id="root">
  //     <div
  //       css={css`
  //         width: 100%;
  //         display: flex;
  //         justify-content: space-between;
  //       `}
  //     >
  //       <div></div>
  //       <button onClick={clearRegion}>clear selection</button>
  //     </div>
  //     <canvas
  //       css={css`
  //         border: 1px solid black;
  //         background-image: url("/sample_image.jpg");
  //         background-size: 100% 100%;
  //       `}
  //       id="viewport"
  //       width="1000"
  //       height="750"
  //       onClick={handleClick}
  //     />
  //   </div>
  // );

  ///////////////////

  const [walletSelector, setWalletSelector] = useState<WalletSelector>();
  const [nearConnection, setNearConnection] = useState<Near>();
  const [nearAccount, setNearAccount] = useState<Account>();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string>();
  const [wallet, setWallet] = useState<Wallet>();
  const [balanceYoctoNear, setBalanceYoctoNear] = useState<string>();
  const [nearPrice, setNearPrice] = useState<number>();

  useEffect(() => {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    const config: ConnectConfig = {
      networkId: "testnet",
      keyStore: keyStore, // first create a key store
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      headers: {},
    };
    connect(config).then((nearConnection) => {
      setNearConnection(nearConnection);
    });
  }, []);

  useEffect(() => {
    if (walletSelector) return;
    setupWalletSelector({
      network: "testnet",
      modules: [setupMyNearWallet({ iconUrl: MyNearIconUrl.src })],
    }).then((walletSelector) => {
      setWalletSelector(walletSelector);
      setSignedIn(walletSelector.isSignedIn());
    });
  }, [walletSelector]);

  useEffect(() => {
    if (!walletSelector || !signedIn) return;
    walletSelector.wallet().then((wallet: any) => {
      setWallet(wallet);
    });
    const accountId = walletSelector.store.getState().accounts[0].accountId;
    setAccountId(accountId);
  }, [walletSelector, signedIn]);

  useEffect(() => {
    if (!nearConnection || !accountId) return;
    nearConnection.account(accountId).then((account: Account) => {
      setNearAccount(account);
    });
  }, [nearConnection, accountId]);

  useEffect(() => {
    axios({
      url: "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd&precision=full",
      method: "GET",
    }).then((response: any) => {
      setNearPrice(response.data.near.usd);
    });
  }, []);

  useEffect(() => {
    if (!nearAccount) return;
    nearAccount.getAccountBalance().then((balance_yoctonear) => {
      setBalanceYoctoNear(balance_yoctonear.total);
    });
  }, [nearAccount]);

  const signIn = () => {
    const desc = "Please select a wallet to sign in.";
    const modal = setupModal(walletSelector!, {
      contractId: "dev-1667967060158-21012588686479",
      description: desc,
    });
    modal.show();
  };

  const signOut = () => {
    wallet!.signOut();
    setSignedIn(false);
    setWallet(undefined);
    setAccountId(undefined);
  };

  if (!signedIn) {
    return (
      <div className="signin-container">
        <div className="logo-container">
          <Image
            src="/ln-logo.png"
            width="80"
            height="80"
            alt="Labeler NearBy logo"
          />
          <div className="main-logo">Labeler NearBy</div>
        </div>
        <button className="signin-button" onClick={signIn}>
          Sign in with NEAR
        </button>
      </div>
    );
  }

  return (
    <div className="container">
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
        <ul>
          <li>Account: {accountId}</li>
          <li>
            Balance: Ⓝ{" "}
            {(Number(balanceYoctoNear) / Math.pow(10, 24)).toFixed(2)}
          </li>
          <li>Near Price: ${nearPrice?.toFixed(2)} </li>
          <li>
            Contract: <input className="contract-input" type="text"></input>
          </li>
        </ul>
        <button className="signout-button" onClick={signOut}>
          SIGN OUT
        </button>
      </div>
      <div className="label-container">
        <div className="viewport"></div>
        <div className="editor-container">
          <div className="region-list"></div>
          <div className="desc-editor"></div>
        </div>
      </div>
    </div>
  );
}
