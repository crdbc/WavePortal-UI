import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';
import "./App.css";
import detectEthereumProvider from '@metamask/detect-provider';

const App = () => {

  // variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [inputText, setInputText] = useState("");
  const [waveMessageText, setWaveMessageText] = useState("");
  const [linkArray, setLinkArray] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x8f0f4bE158324b285ADC0434Af6a1c7C2ef35fca";
  const contractABI = abi.abi;


  const checkIfWalletIsConnected = async () => {
    try {
      /*
      * First make sure we have access to window.ethereum
      */
      //const { ethereum } = window;
      const provider = await detectEthereumProvider();

      if (!provider) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // check if authorised to access user's wallet
      const accounts = await ethereum.request({method: "eth_accounts"});

      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorised account:", account);
        setCurrentAccount(account);
        getAllWaves();
        getAllLinks();
      } else {
        console.log("No authorised account found");
      }

    } catch (error) {
      console.log(error);
    }
  }

  // Connect wallet implementation
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum){
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const getWaveCount = async () => {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setLikeCount(count.toNumber());
      }
  }

  const wave = async () => {
    try{

      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // Execute a wave from the actual smart contract
        const waveTxn = await wavePortalContract.wave(waveMessageText, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        getWaveCount();
        getAllWaves(); 

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          };
        });

        setAllWaves(wavesCleaned);
        getWaveCount();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("getAllWaves error", error);
    }
  }

  const handleLinkDrop = async (e) => {
    try {
      e.preventDefault();

      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const dropLinkTxn = await wavePortalContract.dropLink(inputText);
        console.log("Mining dropLink transaction...", dropLinkTxn.hash);

        await dropLinkTxn.wait();
        console.log("dropLink transaction has been mined!", dropLinkTxn.hash);

        //setLinkCount(linkArray.length + 1);
        getAllLinks();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllLinks = async () => {
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const linkCount = await wavePortalContract.linkCount();

        console.log("Link count:", linkCount);

        let links = [];

        for(var i = 0; i < linkCount; i++){
          const link = await wavePortalContract.linkDetails(i);
          links.push(link);
        }

        if(links.length > 0){
          links.map(link => {
            console.log(link.linkText);
          })

          setLinkArray(links);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleLinkInputChange = (event) => {
    setInputText(event.target.value);
  }

  const handleWaveMessageInputChange = (event) => {
    setWaveMessageText(event.target.value);
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // useEffect(() => {
  //   let wavePortalContract;

  //   const onNewWave = (from, timestamp, message) => {
  //     console.log("NewWave", from, timestamp, message);

  //     setAllWaves(prevState => [
  //       ...prevState,
  //       {
  //         address: from,
  //         timestamp: new Date(timestamp * 1000),
  //         message: message
  //       },
  //     ]);
  //   };

  //   if(window.ethereum) {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();

  //     wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  //     wavePortalContract.on("NewWave", onNewWave);
  //   }

  //   return () => {
  //     if(wavePortalContract) {
  //       wavePortalContract.off("NewWave", onNewWave);
  //     }
  //   };
  // }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Hi, I'm Dave. I'm into building things in web3. This is a little starter project to get me going. I'm feeling good about this! :)
        </div>

        {currentAccount &&
        (<>
        
          <input className="input-text" placeholder="Drop me a message!" type="text" onChange={handleWaveMessageInputChange} />
          <button disabled={!waveMessageText} className="waveButton btn" onClick={wave}>
            Send me a wave 👋
          </button>

        <div className="wave-count-container">
          <h4>A grand total of <span className="wave-count">{likeCount}</span> waves so far. Check out what other people are saying below...</h4>
        </div>

        {
          allWaves.map((wave, index) => {
            return (
              <div key={index} className="message-div">
                <div><span className="message-detail">Posted by //</span> {wave.address}</div>
                <div><span className="message-detail">Time //</span> {wave.timestamp.toString()}</div>
                <div><span className="message-detail">Message //</span> {wave.message}</div>
              </div>
            )
          })
        }


        <div id="learningLink" className="link-container">
          <form onSubmit={handleLinkDrop}>
            <input className="input-text" placeholder="Drop me a web3 learning recommendation!" type="text" onChange={handleLinkInputChange} />
            <button disabled={!inputText} className="btn link-btn" type="submit">
              Drop the link!
            </button>
          </form>
        </div>

        <div className="link-table">
          <h4>List of all recommended links</h4>
          {
            linkArray.length > 0 ?
                <div>
                  <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Link</th>
                    </tr>
                  </thead>

                  {linkArray.map(link => {
                   return (
                    <tbody>
                      <tr>
                        <td>{link.user}</td>
                        <td>{link.linkText}</td>
                      </tr>
                    </tbody>)
                  })}

                  </table>
                </div>
            :
            "No links to display"
          }
        </div>
        </>)}


        {/* if there's no currentAccount, render this button */}
        {!currentAccount && (<button className="waveButton btn" onClick={connectWallet}>Connect Wallet</button>)}
        
      </div>
    </div>
  );
}

export default App