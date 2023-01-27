require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const{rpcUrl,privateKey}=process.env;
module.exports = {
  solidity: "0.8.17",
  networks:{
    bscTestnet:{
      url:rpcUrl,
      accounts:[privateKey],
      chainId:97,
    }
  }
};
