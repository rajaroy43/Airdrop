const Airdrop = artifacts.require("Airdrop");
const MKtoken = artifacts.require("MKtoken");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("airdrop", function (accounts) {
  let token, airdrop;
  const wei = web3.utils.toWei;
  const TOTAL_SUPPLY = wei("1000000", "ether");
  const AIRDROP = wei("100000", "ether");

  beforeEach(async () => {
    token = await MKtoken.new();
    airdrop = await Airdrop.new(token.address);
    await token.transfer(airdrop.address, AIRDROP);
  });
  const createSignature = (params) => {
    const { address: defaultRecipient } = web3.eth.accounts.create();
    params = { recipient: defaultRecipient, amount: wei("100", "ether"), ...params };
    const message = web3.utils.soliditySha3({ t: "address", v: params.recipient }, { t: "uint256", v: params.amount });
    const privatekey = "Admin_Private_Key";
    const { signature } = web3.eth.accounts.sign(message, privatekey);
    return { signature, recipient: params.recipient, amount: params.amount };
  };
  it("Should  claimed when Airdrop Process starts ", async () => {
    const { signature, recipient, amount } = createSignature();
    const tx = await airdrop.startClaimingAirdrop();
    assert(1, tx.logs[0].args.status.toString(), "The contract is not in the right state");
    airdrop.claimTokens(recipient, amount, signature);
    const balance = await token.balanceOf(recipient);
    assert(balance.eq(web3.utils.toBN(amount)));
  });
  it("Should  not able to start airdrop claim state  by other another user ", async () => {
    const { signature, recipient, amount } = createSignature();
    await expectRevert(airdrop.startClaimingAirdrop({ from: accounts[2] }), "only admin");
  });
  it("Should not claimed before admin call startClaimingAirdrop() ", async () => {
    const { signature, recipient, amount } = createSignature();
    await expectRevert(airdrop.claimTokens(recipient, amount, signature), "The contract is not in the right state");
  });
  it("Should not arirdrop more than Airdrop Limit ", async () => {
    const { signature, recipient, amount } = createSignature({ amount: wei("10001", "ether") });
    await airdrop.startClaimingAirdrop();
    await expectRevert(airdrop.claimTokens(recipient, amount, signature), "airdropped 100% of the tokens");
  });
  it("Should Not Airdrop twice for same address ", async () => {
    const { signature, recipient, amount } = createSignature();
    await airdrop.startClaimingAirdrop();
    await airdrop.claimTokens(recipient, amount, signature);
    await expectRevert(airdrop.claimTokens(recipient, amount, signature), "airdrop already processed");
  });
  it("Should Not Airdrop if wrong recipient", async () => {
    const { signature, recipient, amount } = createSignature();
    const { address: wrongRecipient } = web3.eth.accounts.create();
    await airdrop.startClaimingAirdrop();
    await expectRevert(airdrop.claimTokens(wrongRecipient, amount, signature), "wrong signature");
  });
  it("Should Not Airdrop if wrong Amount", async () => {
    const { signature, recipient, amount } = createSignature();
    const wrongAmount = wei("1002", "ether");
    await airdrop.startClaimingAirdrop();
    await expectRevert(airdrop.claimTokens(recipient, wrongAmount, signature), "wrong signature");
  });
  it("Should Not Airdrop if wrong Signature", async () => {
    const { signature, recipient, amount } = createSignature();
    const wrongSignature =
      "0xc120037804cd0982caea594925b0e0b956c0774a2f70e5c066a494ec79a451c03c69a0276a2753f237fac4e5fbdbe8033e266e290809b0c059b67a4cfc478a9e1c";
    await airdrop.startClaimingAirdrop();
    await expectRevert(airdrop.claimTokens(recipient, amount, wrongSignature), "wrong signature");
  });
  it("Should Withdraw all left Airdrop Ammount", async () => {
    const { signature, recipient, amount } = createSignature();
    const [account, _] = accounts;
    const balanceBeforeWithdrawAirdrop = parseInt((await token.balanceOf(account)).toString()) / 10 ** 18;
    await airdrop.startClaimingAirdrop();
    await airdrop.claimTokens(recipient, amount, signature);
    await airdrop.endClaimingAirdrop();
    const tx = await airdrop.withDrawLeftAirdrop();
    assert(parseInt(parseInt(tx.logs[0].args.amount.toString()) / 10 ** 18) == 10000 - 100);
    const balanceAfterWithdrawAirdrop = parseInt((await token.balanceOf(account)).toString()) / 10 ** 18;
    console.log("balanceBeforeWithdrawAirdrop", balanceBeforeWithdrawAirdrop);
    console.log("balanceAfterWithdrawAirdrop", balanceAfterWithdrawAirdrop);
    assert(balanceAfterWithdrawAirdrop > balanceBeforeWithdrawAirdrop, "Not able to withdraw all airdropped tokens");
  });
});
