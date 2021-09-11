import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Link} from 'react-router-dom';
import Logo from './partials/Logo';
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

const propTypes = {
  navPosition: PropTypes.string,
  hideNav: PropTypes.bool,
  hideSignin: PropTypes.bool,
  bottomOuterDivider: PropTypes.bool,
  bottomDivider: PropTypes.bool
}

const defaultProps = {
  navPosition: '',
  hideNav: false,
  hideSignin: false,
  bottomOuterDivider: false,
  bottomDivider: false
}

const Header = ({
  className,
  navPosition,
  hideNav,
  hideSignin,
  bottomOuterDivider,
  bottomDivider,
  ...props
}) => {

  const [isActive, setIsactive] = useState(false);
  const [isRightChain, setIsRightChain] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [isUnLocked, setIsUnlocked] = useState(window.hasOwnProperty('ethereum') ? window.ethereum._metamask.isUnlocked() : false);
  let web3;



  useEffect(()=>{
    if(isRightChain) {
       getProvider().then((newProvider)=> {
         setProvider(newProvider);
         startApp(newProvider); // Initialize your app
         window.ethereum.on('accountsChanged', handleAccountsChanged);
       });

    }
  },[isRightChain]);
  useEffect(()=>{
    console.log('is un '+isUnLocked);
  }, [isUnLocked]);
  const nav = useRef(null);
  const hamburger = useRef(null);

  useEffect(() => {
    isActive && openMenu();
    document.addEventListener('keydown', keyPress);
    document.addEventListener('click', clickOutside);
    return () => {
      document.removeEventListener('keydown', keyPress);
      document.removeEventListener('click', clickOutside);
      closeMenu();
    };
  });

  const openMenu = () => {
    document.body.classList.add('off-nav-is-active');
    nav.current.style.maxHeight = nav.current.scrollHeight + 'px';
    setIsactive(true);
  }

  const closeMenu = () => {
    document.body.classList.remove('off-nav-is-active');
    nav.current && (nav.current.style.maxHeight = null);
    setIsactive(false);
  }

  const keyPress = (e) => {
    isActive && e.keyCode === 27 && closeMenu();
  }

  const clickOutside = (e) => {
    if (!nav.current) return
    if (!isActive || nav.current.contains(e.target) || e.target === hamburger.current) return;
    closeMenu();
  }

  const classes = classNames(
    'site-header',
    bottomOuterDivider && 'has-bottom-divider',
    className
  );

  useEffect(()=>{
    init();
  }, [])
  const getProvider = async ()=> {
    return  await detectEthereumProvider();
  }
  const init = async ()=>{
    let provider =   await detectEthereumProvider();
    if (provider) {
      if(provider.chainId !== '0x38') {
        setProvider(null)
        console.log('LOL wroning')
        switchChain();
      } else {
        console.log('LOL ok')
        setIsRightChain(true);
        startApp(provider); // Initialize your app
        setProvider(provider);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

    } else {
      console.log('Please install MetaMask!');
    }

  }
  function switchChain () {
    window.ethereum.request({ method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38'}]}).then(()=> setIsRightChain(true))
      .catch(()=>{
        setIsRightChain(false);
      });
  }

  function startApp(provider) {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }
      provider.on('accountsChanged', function (accounts) {
        console.log(accounts[0])
      });
      console.log(provider);
      if (provider.selectedAddress) {
        setCurrentAccount(provider.selectedAddress);
      }
      web3 = new Web3(window.ethereum);
      // Access the decentralized web!
  }

  function connect() {

    if(provider) {
    //   if(provider.chainId !== '0x38') {
    //     switchChain();
    //   } else {
        window.ethereum
          .request({method: 'eth_requestAccounts'})
          .then(handleAccountsChanged)
          .catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log('Please connect to MetaMask.');
            } else {
              console.error(err);
            }
          });
      } else {
      init();
    }
    // }

  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setCurrentAccount(null);
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(accounts[0]);
      // Do any other work!
    }
  }
  function hiddeAddress(address) {
    return address.substr(0,5)+ "...."+ address.substr(address.length-10, address.length)
  }

// The minimum ABI required to get the ERC20 Token balance


  return (
    <header
      {...props}
      className={classes}
    >
      <div className="container">
        <div className={
          classNames(
            'site-header-inner',
            bottomDivider && 'has-bottom-divider'
          )}
        style={{width: '100vw', paddingRight: "700px"}}>
          <Logo />
          {!hideNav &&
            <>
              <button
                ref={hamburger}
                className="header-nav-toggle"
                onClick={isActive ? closeMenu : openMenu}
              >
                <span className="screen-reader">Menu</span>
                <span className="hamburger">
                  <span className="hamburger-inner"></span>
                </span>
              </button>
              <nav
                ref={nav}
                className={
                  classNames(
                    'header-nav',
                    isActive && 'is-active'
                  )}>
                <div className="header-nav-inner">
                  <ul className={
                    classNames(
                      'list-reset text-xs',
                      navPosition && `header-nav-${navPosition}`
                    )}>
                    <li>
                      <Link to="#0" onClick={closeMenu}>Documentation</Link>
                    </li>
                  </ul>
                  <button onClick={async ()=> {
                    // const minABI = [
                    //   // balanceOf
                    //   {
                    //     constant: true,
                    //     inputs: [{ name: "_owner", type: "address" }],
                    //     name: "balanceOf",
                    //     outputs: [{ name: "balance", type: "uint256" }],
                    //     type: "function",
                    //   },
                    // ];
                    // const tokenAddress = "0xc8e8ecb2a5b5d1ecff007bf74d15a86434aa0c5c";
                    // const walletAddress = "0x0f83933b4D172a6c44B6396CB45806D92c8EA9DD";
                    //
                    // const contract = new web3.eth.Contract(minABI, tokenAddress);
                    //
                    //   const result = await contract.methods.balanceOf(walletAddress).call(); // 29803630997051883414242659
                    //
                    //   const format = web3.utils.fromWei(result, 'nano'); // 29803630.997051883414242659
                    // console.log(format);

                    // web3.eth.sendTransaction({
                    //   from: '0x0f83933b4D172a6c44B6396CB45806D92c8EA9DD',
                    //   to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                    //   value: '10000'
                    // })
                    //   .on('transactionHash', function(hash){
                    //       console.log(hash)
                    //   })
                    //   .on('receipt', function(receipt){
                    //    console.log(receipt);
                    //   })
                    //   .on('confirmation', function(confirmationNumber, receipt){
                    //     console.log(confirmationNumber)
                    //   })
                    //   .on('error', console.error); // If a out of gas error, the second parameter is the receipt.

                    // wallet_switchEthereumChain


                  }}>aa</button>
                  {!hideSignin &&
                    <ul
                      className="list-reset header-nav-right"
                    >
                      <li>
                        {
                          currentAccount ? !isUnLocked ?  <button to="#0" className="button button-primary button-wide-mobile button-sm" onClick={()=>connect()}>Unlock wallet</button> :  <div>Your address: {hiddeAddress(currentAccount)}</div> :
                            <button to="#0" className="button button-primary button-wide-mobile button-sm" onClick={()=>connect()}>Connect wallet</button>
                        }

                      </li>
                    </ul>}
                </div>
              </nav>
            </>}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
