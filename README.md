# Airdrop

Airdropping MKtoken to all whitelisted address using backend database(Firebase,mongodb,etc) .
using will registerd their address for airdropping ,and if they are avilable then they will able to claim their airdropped tokens .
Here how user will get Airdropped tokens:

1)User will registered their address when airdropping announce ,and their address will store in database.
2)After some time when airdropping start ,then User will able to claim Mktoken. 3) User will ask signature from backend
4)Backend will get record from database and if record found then
5)Backend will provide signature (receipient Address,claim ammount) by using admin private key.
6)User will call claimTokens() with argument `recipient address,claimAmount,adminSignataure` .
7)After verfication ,Airdrop contract will send tokens to users.
