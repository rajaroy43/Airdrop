const MKtoken = artifacts.require("MKtoken");
let token;
const TOTAL_SUPPLY = web3.utils.toWei("1000000");
before(async () => {
  token = await MKtoken.new();
});
contract("MKtoken", function (accounts) {
  const [admin, _] = accounts;
  it("admin should have total supply", async () => {
    const totalSupply = await token.totalSupply();
    const balanceAdmin = await token.balanceOf(admin);
    assert(totalSupply.toString() === TOTAL_SUPPLY);
    assert(balanceAdmin.toString() === TOTAL_SUPPLY);
  });
});
