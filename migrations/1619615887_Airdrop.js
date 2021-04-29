const Airdrop = artifacts.require("Airdrop");
const MKtoken = artifacts.require("MKtoken");
module.exports = async (_deployer) => {
  // Use deployer to state migration tasks.
  const token = await MKtoken.deployed();
  await _deployer.deploy(Airdrop, token.address);
  const airdrop = await Airdrop.deployed();
  const amount = web3.utils.toWei("10000", "ether");
  await token.transfer(airdrop.address, amount);
};
