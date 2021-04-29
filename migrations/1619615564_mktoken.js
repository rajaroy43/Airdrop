const MKtoken = artifacts.require("MKtoken");
module.exports = async (_deployer) => {
  // Use deployer to state migration tasks.
  await _deployer.deploy(MKtoken);
};
