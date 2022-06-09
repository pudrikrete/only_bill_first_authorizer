# only_bill_first_authorizer - EOS / WAX Cloud Wallet

This project shows how it's possible to use the **only_bill_first_authorizer** feature of the EOS blockchain when the transaction is being signed by a Wax Cloud Wallet. 
The front-end is a simple interface where the end-user would sign into their Wax Cloud Wallet and then send a fixed amount of WAX to another account. 
The blockchain resources that are used (cpu/net/ram) would then be billed to the preconfigured account. 
This allows a developer to build an interface that will allow users to perform transactions on the blockchain without having to use their own blockchain resources.

It may be more efficient to jump from section to section. For example, while Ubuntu is installing, you may want to download the source files and reconfigure them to your environment.
This was made possible following the post by CMICHEL at https://cmichel.io/eosio-how-to-pay-for-users-cpu/.

&emsp;⬜ Used Windows software<BR>
&emsp;&emsp;⬜ WinSCP - https://winscp.net/eng/download.php	<BR>
&emsp;&emsp;⬜ Putty - https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html	<BR>
&emsp;&emsp;⬜ Notepad++ - https://notepad-plus-plus.org/downloads/	<BR>
&emsp;&emsp;⬜ EOSIO Key	creator – https://eoskey.io/

## SECTION I - SET UP NEW WALLET / EOS / WAX ACCOUNT

If you already have a 12-character WAX account with keys / permissions, you can skip this section.<p>

&emsp;⬜ Open EOSIO Key creator to generate keys<BR>		 
&emsp;⬜ Click on the Generate button several times<BR>
&emsp;&emsp;&emsp;&emsp;Get two copies of keys <B>MAKE SURE THESE ARE BACKED UP IN A SECURE LOCATION</b><BR>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;One set will be for the OWNER permissions<BR>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;One set will be for the ACTIVE permissions<BR>
&emsp;⬜ Sign into your WAX Cloud Wallet dashboard - https://wallet.wax.io<BR>
&emsp;⬜ Click on Settings -> Create new WAX account<BR>
&emsp;⬜ Fill out the form, modify how much you want to stake (you can add/remove later), check to transfer 
       the staked resources to the new account, and then click the Create WAX account button. <B>Sometimes this form doesn’t show a success message. Check wax.bloks.io to see if your account was made before clicking the button again</b>

## SECTION II - INTERFACE CONFIGURATION (SERVER SIDE AND FRONT END)
&emsp;⬜ Download source files (from this repository)<BR>
&emsp;⬜ Select Code -> download ZIP<BR>
&emsp;⬜ Unzip the files (for this guide we will assume you unzipped to C:\Interface\)<BR>
###### Set up server files to match environment<BR>
&emsp;&emsp;⬜ c:\interface\server\env\production.env<BR>
&emsp;&emsp;&emsp;&emsp;⬜ Change the EOSIO_SIGNING_KEY= to be the PRIVATE KEY of the account you are using<BR>		
&emsp;&emsp;⬜ c:\interface\server\src\routes\sign.ts<BR>
&emsp;&emsp;&emsp;&emsp;⬜ Modify the injected action (lines 54-64)<BR>
```
tx.actions.unshift({
	account: "res.pink",
	name: "noop",
	authorization: [
		{
			actor: "YOUR-12-CHARACTER-ACCOUNT",
			permission: "PERMISSION USED(usually owner/active)",
		},
	],
	data: {},
})	
```
###### Set up front end files to match environment
&emsp;⬜ Finish SECTION III first <br>
&emsp;⬜ c:\interface\frontend\only_bill_first_authorizer.js <br>
> Change lines 95-97 <br>
```
to: 'wax_account_address',
quantity: "0.10000000 WAX",
memo: ‘test transaction’
```
> Change line 139 <br>
```
const rawResponse = await fetch('http://192.168.1.60:3031/api/eos/sign', {
```
&emsp;⬜ Use WinSCP to copy c:/interfaces/frontend/ to /var/www/html/

## SECTION III - SERVER SET UP

&emsp;⬜ Download Ubuntu Server (21.04 LTS) - https://ubuntu.com/download/server#releases <br>
&emsp;⬜ Install Ubuntu Server as a VM (2 vCPU, 4 GB RAM, 40 GB HDD should suffice) <br>
&emsp;&emsp;⬜ Install OpenSSH as part of the installation <br>
&emsp;⬜ Set up the new system with software, updates, and then configure <br>
&emsp;&emsp;&emsp;The system needs NodeJS, NPM, Cleos (optional), Apache (optional) <br>
&emsp;&emsp;&emsp;⬜ Run the following commands to install software: <br>
```
cd ~
wget https://github.com/eosio/eos/releases/download/v2.1.0/eosio_2.1.0-1-ubuntu-20.04_amd64.deb
sudo apt install ./eosio_2.1.0-1-ubuntu-20.04_amd64.deb
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install apache2
```
&emsp;⬜ Set up wallet (optional - if you already have a private wallet you can skip this) <br>
```
cd ~
cleos wallet create -n 12-char-wallet-address --file 12-char-wallet-address.pwd
```
&emsp;&emsp;⬜ Open password file and save password to a secure location
```
sudo nano 12-char-wallet-address.pwd
```
&emsp;&emsp;⬜ Unlock using password to make sure we have access to the new account
```
cleos wallet lock -n 12-CHAR-WALLET-ADDRESS
cleos wallet unlock -n 12-char-wallet-address
```
&emsp;&emsp;⬜ Import the private key with owner permissions
```
cleos wallet import -n 12-char-wallet-address --private-key PRIVATE_KEY_FOR_OWNER
```
&emsp;&emsp;⬜ Send 5 wax to the account so that we can test staking <BR>
&emsp;&emsp;⬜ Stake 5 wax to CPU to make sure we have the account configured properly
```
cleos -u https://wax.greymass.com push transaction '{
  "delay_sec": 0,
  "max_cpu_usage_ms": 0,
  "actions": [
    {
      "account": "eosio",
      "name": "delegatebw",
      "data": {
        "from": "12-CHAR-WALLET-ADDRESS",
        "receiver": "12-CHAR-WALLET-ADDRESS ",
        "stake_net_quantity": "0.00000000 WAX",
        "stake_cpu_quantity": "5.00000000 WAX",
        "transfer": false
      },
      "authorization": [
        {
          "actor": "12-CHAR-WALLET-ADDRESS ",
          "permission": "owner"
        }
      ]
    }
  ]
}'
```
&emsp;&emsp;⬜ Verify that we have staked 5 WAX – the wallet is set up in cleos correctly <BR>
&emsp;&emsp;⬜ Lock wallet if we are done with it
```	
cleos wallet lock -n 12-CHAR-WALLET-ADDRESS
```

&emsp;⬜ Copy server files with WinSCP <BR>
&emsp;&emsp;&emsp;⬜ Make sure all server files in Section II have been modified. <BR>
&emsp;&emsp;&emsp;⬜ Copy all files from C:\interface\server\ to /var/www/server <BR>
&emsp;⬜ Additional server side set up <BR>
```
sudo mkdir -p /var/www/server
sudo chmod -R 777 /var/www
cd /var/www/server
npm install
```
## SECTION IV – Running software
To run the nodeos server manually, get into the /var/www/server directory and simply run: <BR>
```
npm start
```
If you want to automatically run the nodeos server at startup, the easiest thing to do is add an entry to your crontab file to run a script that starts the nodeos server after reboot. The steps to do this are fairly easy: <BR>
&emsp;⬜ Edit crontab file ( if you're asked what editor to use, pick #1 nano ): <BR>
```
sudo crontab -e	
```
&emsp;⬜ Add the following line to the bottom of the file and then save/exit: <BR>
```
@reboot ( sleep 90 ; sh /var/www/server/startup.sh )	
```
&emsp;⬜ Create the startup script /var/www/server/startup.sh <BR>
```
sudo nano /var/www/server/startup.sh
```
&emsp;⬜ Add two lines to the file:
```
cd /var/www/server
npm start
```
## SECTION V – HTTP or HTTPS
You have the option of running the nodeos server either in http (default) or https. The configuration for https is a little more advanced and requires a certificate. The steps to aquire a certificate are beyond the scope of these instructions, but if you know how to get them, follow the below steps to configure the nodeos server and front end to use https instead.
&emsp;⬜ Make a directory for the certificates <BR>
```
sudo mkdir -p /var/www/server/src/certs
```
&emsp;⬜ Copy your certificate files (certificate and key) into this directory. You can use the default file names for the certificates after you've gotten them, you just need to make sure to edit the nodeos server source files appropriately afterwards. <BR>
&emsp;⬜ Modify nodeos server file /var/www/server/src/start.ts <BR>
> Uncomment lines 6 - 15 (remove the leading // at the beginning of the lines) <BR>
> Modify file names for the private key and certificate file you copied to /var/www/server/src/certs (lines 8 & 9) <BR>	
> Comment lines 17-19 (add // to the start of the lines) <BR>
The file should look similar to below: 
```
import app from '@server';

// Start the server
const port = Number(process.env.PORT || 3031);

var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('src/certs/private.key', 'utf8');
var certificate = fs.readFileSync('src/certs/certificate.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
	console.log('HTTPS express server started on port: ' + port);
});

//app.listen(port, () => {
//   console.log('Express server started on port: ' + port);
//});
```
&emsp;⬜ Modify c:\interface\frontend\only_bill_first_authorizer.js <BR>
&emsp;&emsp;&emsp;( you may have moved this to the server already and it is located in /var/www/html ) <BR>
> Change line 139 from http to https <BR>
```
const rawResponse = await fetch('https://192.168.1.60:3031/api/eos/sign', {
```
## SECTION VI – Testing
&emsp;⬜ Go to the front end by visiting the IP address of the Ubuntu server that was set up (in a browser) <BR>
&emsp;⬜ Open your browser’s developer console to check for errors <BR>
&emsp;⬜ Click on the Login button <BR>
&emsp;⬜ Sign into your Wax Cloud Wallet <BR>
&emsp;⬜ Click on the Transfer button <BR>
&emsp;⬜ Approve the transaction <BR>
