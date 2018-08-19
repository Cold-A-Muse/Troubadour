import React, { Component } from "react";
import createIExecContracts from "iexec-contracts-js-client";
import EthJs from "ethjs";

var extract = require("extract-zip");
var Web3 = require("web3");
var web3 = window.web3;

var ethjs = new EthJs(window.web3.currentProvider);

const Promise = require("bluebird");
const createIEXECClient = require("iexec-server-js-client");
const oracleJSON = require("iexec-oracle-contract/build/contracts/IexecOracle.json");
const iexec = createIEXECClient({ server: "https://testxw.iex.ec:443" });
const Extensions = require("iexec-poco-v2/utils/extensions.js");
const createIExecClient = require("iexec-server-js-client");

const statusMap = {
  0: "UNSET",
  1: "ACTIVE",
  2: "REVEALING",
  3: "CLAIMED",
  4: "COMPLETED"
};

class FileSelecter extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleMarket = this.handleMarket.bind(this);
    this.state = { stateFile: {}, naf: "", status: "" };
  }

  handleChange(event) {
    var file = event.target.files[0];
    console.log("MIME type file: ", file.type);
    this.setState({ stateFile: file });

    var fileDisplayArea = document.getElementById("preview");
    var reader = new FileReader();

    reader.readAsText(file);

    reader.onload = event => {
      if (file.type == "text/plain") {
        fileDisplayArea.innerText = reader.result;
      } else {
        fileDisplayArea.innerText = "No preview available";
      }
    };
    //console.log(JSON.stringify(event[0]));
  }

  async handleMarket(event) {
    event.preventDefault();

    var formData = new FormData();
    formData.append("file", this.state.stateFile);

    const fileUrl = await fetch("http://127.0.0.1:8081/docker_path", {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(response => {
        return response;
      })
      .catch(console.log.bind(this));

    console.log("fileUrl: ", JSON.stringify(fileUrl));

    // creates a contract to interact with the decentralized marketplace by iExec
    const iexecContract = await createIExecContracts({
      eth: ethjs, // eth provider
      chainID: 42, //kovan
      txOptions: {
        from: web3.eth.accounts[0],
        gas: 2500000
      },
      hubAddress: "0x12b92a17b1ca4bb10b861386446b8b2716e58c9b" //kovan //iexec smart contract address
    });

    const marketplaceAddress = await iexecContract.fetchMarketplaceAddress();

    const cmdLine = JSON.stringify({ cmdline: 'bash pipe.sh ' + fileUrl.transferURL });

    // Iterates through all orders and selects the cheapest one available in category 5
    const cheapestOrderId = await this.getOrder();

    // RPC = Remote Procedure Call to marketplace to retrieve data about workerpool necessary to buy the correct buy order
    const orderRPC = await iexecContract
      .getMarketplaceContract({ at: marketplaceAddress })
      .getMarketOrder(cheapestOrderId)
      .catch(console.log.bind(console));

    const applicationHash = "0x4C776ADc0D96c9b176E2dd0A7F349a06858689fd"; // Hash of your d-app (in this case Troubadour Alpha)

    //Arguments used to buy a work order and send your work request to a worker pool
    const args = [
      cheapestOrderId,
      orderRPC.workerpool,
      applicationHash, // dappAddress,
      "0x0000000000000000000000000000000000000000", // dataset
      cmdLine,
      "0x0000000000000000000000000000000000000000", // callback
      web3.eth.accounts[0] // beneficiary
    ];

    const aIexecHubInstance = await iexecContract.getHubContract();

    // Buys a work order
    const txMined = await aIexecHubInstance.buyForWorkOrder(...args, {
      from: web3.eth.accounts[0] // First account in metamask
    });

    console.log("txMined: ", txMined);

    const txReceipt = await iexecContract.waitForReceipt(txMined);
    console.log("txReceipt: ", txReceipt);

    const events = iexecContract.decodeHubLogs(txReceipt.logs);
    console.log("Events: ", events);

    let woid = await events[0].woid; // ID of your work that is being executed
    console.log("woid:", woid);

    let aWorkOrderInstance = await iexecContract.getWorkOrderContract({
      at: woid
    });

    /*
    const testWoid = "0xc1995b5Bb7B695afeb29177eb02a7a2bf2EE3c9B";
    let aWorkOrderInstance = await iexecContract.getWorkOrderContract({
      at: testWoid
    });
    */

    const FETCH_INTERVAL = 5000;
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    console.log("workOrderInstance", aWorkOrderInstance);
    let status = await aWorkOrderInstance.m_status.call(); // Calls a contract function to retrieve the status of your work

    let workStatusName = statusMap[status[0].words[0].toString()];
    console.log("workstatusname: ", workStatusName);

    if (!["COMPLETED", "CLAIMED"].includes(workStatusName)) {
      console.log("inside waitForWorkStatus if statement");
      workStatusName = await this.waitForWorkStatus(
        aWorkOrderInstance,
        workStatusName
      );
      await this.retrieveBlockchainResult(aWorkOrderInstance);
    } else {
      await this.retrieveBlockchainResult(aWorkOrderInstance);
    }
  }

  async waitForWorkStatus(aWorkOrderInstance, prevStatus, counter = 0) {
    const FETCH_INTERVAL = 5000;
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    try {
      const workStatus = await aWorkOrderInstance.m_status.call();
      const workStatusName = statusMap[workStatus[0].words[0].toString()];
      if (workStatusName === "COMPLETED") return workStatusName;
      if (workStatusName === "CLAIMED") return workStatusName;
      if (workStatusName !== prevStatus) {
        console.log("new status change", workStatusName);
      }
      await sleep(FETCH_INTERVAL);
      console.log("work status not changed: ", workStatusName);
      return this.waitForWorkStatus(
        aWorkOrderInstance,
        workStatusName,
        counter + 1
      );
    } catch (error) {
      throw error;
    }
  }

  async getEntities(inputJSON) {
    const downloadData = JSON.stringify(inputJSON);

    return fetch("http://127.0.0.1:8081/process_result", {
      method: "POST",
      body: downloadData,
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(result => result.json())
      .then(response =>
        this.setState({ naf: response.splittedEntities }, () => {
          console.log("NAF after first fetch:", this.state.naf);
          //this.props.sendNafToParent(this.state.naf);
        })
      )
      .then(() => {
        this.props.sendNafToParent(this.state.naf);
      })
      .catch(console.log.bind(console));
  }

  async retrieveBlockchainResult(aworkOrderInstance) {
    console.log("in retrieveBlockchainResult");
    let status = await aworkOrderInstance.m_status.call();
    let workStatusName = statusMap[status[0].words[0].toString()];

    const uri = await aworkOrderInstance.m_uri.call();
    console.log("download Uri: ", uri[0]);
    const server = "https://".concat(uri[0].split("/")[2]);
    console.log("server: ", server);

    const scheduler = createIExecClient({ server }); // creates a client to interact with the workerpool used for your finished work

    scheduler
      .auth(web3.currentProvider, web3.eth.accounts[0])
      .then(async ({ jwtoken, cookie }) => {
        const download = await scheduler.createDownloadURI(uri[0]);
        console.log(download);

        const downloadData = {
          uri: uri[0],
          server: server,
          jwtoken: jwtoken
        };

        await this.getEntities(downloadData);

        console.log(download);
        //window.open(download);
      })
      .catch(console.log.bind(console));
  }

  async getOrder() {
    const baseURL = "https://gateway.iex.ec/orderbook?category=";
    const category = 5;
    const marketURL = baseURL + category;

    return fetch(marketURL, {
      method: "GET"
    })
      .then(response => response.json())
      .then(response => {
        return this.getCheapestOrder(response.orders);
      })
      .catch(console.log.bind(console));
  }

  getCheapestOrder(orders) {
    var cheapestOrderPrice = 99999999999999999999;
    var cheapestOrderId = null;
    for (var order of orders) {
      if (order.value < cheapestOrderPrice) {
        cheapestOrderPrice = order.value;
        cheapestOrderId = order.marketorderIdx;
      }
    }
    console.log(
      "Cheapest order after iterating through orderbook: ",
      cheapestOrderPrice,
      "with orderId: ",
      cheapestOrderId
    );
    return cheapestOrderId;
  }

  render() {
    return (
      <div className="fileselector">
        <form method="POST" enctype="multipart/form-data">
          <input
            type="file"
            name="file"
            size="50"
            onChange={e => this.handleChange(e)}
          />
          <input
            type="submit"
            value="Upload File"
            onClick={e => this.handleMarket(e)}
          />
        </form>
      </div>
    );
  }
}

export default FileSelecter;
