import { useState, useEffect } from "react";
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
import dynamic from "next/dynamic";

const Viewport = dynamic(() => import("../components/Viewport"), {
  ssr: false,
});

const IMAGE_URL = "/sample-image-0.jpg";

export default function Home() {
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
        <Viewport />
        <div className="editor-container">
          <div className="region-list"></div>
          <div className="desc-editor"></div>
          <div className="button-container"></div>
        </div>
      </div>
    </div>
  );
}
