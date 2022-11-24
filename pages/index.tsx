import { useState, useEffect } from "react";
import {
  Near,
  keyStores,
  connect,
  ConnectConfig,
  Account,
  providers,
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
import Image from "next/image";

import LabelWorkspace from "../components/LabelWorkspace";
import ContractSelector from "../components/ContractSelector";
import TopBar from "../components/TopBar";

export default function Home() {
  const [walletSelector, setWalletSelector] = useState<WalletSelector>();
  const [nearConnection, setNearConnection] = useState<Near>();
  const [nearAccount, setNearAccount] = useState<Account>();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string>();
  const [wallet, setWallet] = useState<Wallet>();
  const [balanceYoctoNear, setBalanceYoctoNear] = useState<string>();
  const [nearPrice, setNearPrice] = useState<number>();
  const [contractId, setContractId] = useState<string>();
  const [contractAccount, setContractAccount] = useState<Account>();
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [task, setTask] = useState<any>();
  const [rsaKeyPair, setRsaKeyPair] = useState({ public: "", private: "" });
  // placeholder
  const requestTask = async () => {
    return {
      url: "<server-url>",
      id: "<job-id>",
      label_keys: ["corn plant", "grass", "dirt"],
      task: {
        type: "label",
        assigned_to: "pitaya.testnet",
        time_assigned: "<epoch-time-ns>",
      },
    };
  };

  // placeholder
  const submitTask = async () => {
    await setTimeout(() => {}, 10000);

    console.log({
      job_id: "",
      submission: {
        ...task,
        public_key: "<rsa-key>",
        time_submitted: "<epoch-time-ns>",
        data: "<submission-data>",
      },
    });
  };

  // placeholder
  const fetchImageAndDescription = async () => {
    await setTimeout(() => {}, 10000);

    return {
      image: null,
      job_description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in porta nunc, sed fringilla augue. Cras nec dui urna. Vivamus et bibendum arcu. Donec arcu ex, aliquet vel nulla vel, porta ullamcorper diam. Pellentesque suscipit, ipsum eget vestibulum congue, arcu turpis viverra lorem, vitae interdum massa velit quis augue. Sed ornare diam at cursus tincidunt. Nullam arcu lorem, fringilla sed vehicula mattis, egestas ac nisi. Nunc molestie nulla augue, vel pellentesque eros lobortis vel. Morbi at lacus ut turpis dignissim efficitur in a massa. Duis pellentesque in quam vitae pharetra. Duis ac ex metus. Curabitur facilisis erat in eros ultrices, et volutpat eros tincidunt. Aenean vulputate enim a justo elementum convallis.",
    };
  };

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

    axios({
      method: "GET",
      url: "/api/keypair",
    }).then((response: any) => {
      setRsaKeyPair({
        public: response.data.public,
        private: response.data.private,
      });
    });
  }, [walletSelector, signedIn]);

  useEffect(() => {
    if (!accountId) return;

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

      nearConnection.account(accountId).then((account: Account) => {
        setNearAccount(account);
        account.getAccountBalance().then((balance_yoctonear) => {
          setBalanceYoctoNear(balance_yoctonear.total);
        });
      });
    });
  }, [accountId]);

  useEffect(() => {
    if (!nearConnection || !accountId) return;
    nearConnection.account(accountId).then((account: Account) => {
      setNearAccount(account);

      account.getAccountBalance().then((balance_yoctonear) => {
        setBalanceYoctoNear(balance_yoctonear.total);
      });
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

  const signIn = () => {
    const desc = "Please select a wallet to sign in.";
    const modal = setupModal(walletSelector!, {
      contractId: "dev-1669013049236-11804026617018",
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

  useEffect(() => {
    if (!nearConnection || !contractId) return;

    const contractIsValid = async (contractId: string): Promise<boolean> => {
      if (!nearConnection) return false;

      try {
        const account = await nearConnection.account(contractId);
        await account.state(); // will error if account doesn't exist
      } catch (err: any) {
        // throw any error unrelated to the account not existing
        if (!err.message.includes("does not exist while viewing")) {
          throw err;
        }
        return false;
      }
      return true;
    };

    contractIsValid(contractId).then((valid) => {
      if (valid) {
        nearConnection
          .account(contractId)
          .then((account: Account) => setContractAccount(account));
      }
    });
  }, [nearConnection, contractId]);

  useEffect(() => {
    if (!contractId) return;

    requestTask()
      .then((response) => {
        setLabelKeys(response.label_keys);
        setTask(response.task);
      })
      .then(() => fetchImageAndDescription())
      .then((response) => {
        setJobDescription(response.job_description);
      });
  }, [contractId]);

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
      <TopBar onClick={signOut} />
      <div className="workspace-container">
        {contractId ? (
          <LabelWorkspace
            labelKeys={labelKeys}
            jobDescription={jobDescription}
          />
        ) : (
          <ContractSelector setter={setContractId} />
        )}
      </div>
      <div className="bottom-bar">
        <ul>
          <li>Account: {accountId}</li>
          <li>
            Balance: Ⓝ{" "}
            {(Number(balanceYoctoNear) / Math.pow(10, 24)).toFixed(2)}
          </li>
          <li>Near Price: ${nearPrice?.toFixed(2)} </li>
        </ul>
        <div className="contract-name">
          {contractAccount ? `Contract: ${contractId}` : ""}
        </div>
      </div>
    </div>
  );
}
