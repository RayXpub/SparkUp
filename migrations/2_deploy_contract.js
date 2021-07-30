const CampaignFactory = artifacts.require('CampaignFactory');
const TestUSDC = artifacts.require('TestUSDC');
const Escrow = artifacts.require('Escrow');
const USDC_CONTRACTS = {
  "mainnet": '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  "ropsten-fork": '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  "ropsten": '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
};

module.exports = async (deployer, network, accounts) => {
  let addressUSDC;
  if (network === 'development' || network === 'soliditycoverage') {
    await deployer.deploy(TestUSDC, accounts[0]);
    const TUSDC = await TestUSDC.deployed();
    console.log("TUSDC address : ", TUSDC.address)
    addressUSDC = TUSDC.address;
  } else {
    console.log("network :",network)
    addressUSDC = USDC_CONTRACTS[network];
  }
  const escrowContract = await deployer.deploy(Escrow, addressUSDC);
  await deployer.deploy(CampaignFactory, addressUSDC, escrowContract.address);
};
