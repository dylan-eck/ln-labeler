import { useState, useEffect } from "react";
import { setupModal } from "@near-wallet-selector/modal-ui";
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png";
import {
  setupWalletSelector,
  Wallet,
  WalletSelector,
} from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import "@near-wallet-selector/modal-ui/styles.css";

export default function Home() {
  const [walletSelector, setWalletSelector] = useState<WalletSelector>();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string>();
  const [wallet, setWallet] = useState<Wallet>();

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
      <div>
        <button onClick={signIn}>Sign in with NEAR</button>
      </div>
    );
  }

  return (
    <div>
      <div>Hello {accountId}!</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
