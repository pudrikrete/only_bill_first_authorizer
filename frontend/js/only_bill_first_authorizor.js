const wax = new waxjs.WaxJS({
			rpcEndpoint: 'https://api.waxsweden.org',
			tryAutoLogin: false,
			freeBandwidth: true});
			
class sys{
	constructor() {
		this.isRunning = false;
	}
	

	
delay = (millis) =>
  new Promise((resolve, reject) => {
    setTimeout((_) => resolve(), millis);	
  });
  
isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

async postData(url = '', data = {}, method = 'POST',header = {'Content-Type': 'application/json'},returnMode = 'json') {
  try {
    const init = (method == 'POST') ? {method: method,mode: 'cors', cache: 'no-cache',credentials: 'same-origin',headers: header,redirect: 'follow',referrerPolicy: 'no-referrer',body: JSON.stringify(data)} : {method: method,mode: 'cors', cache: 'no-cache',credentials: 'same-origin',headers: header,redirect: 'follow',referrerPolicy: 'no-referrer'}
    if(returnMode == 'json'){
      const response = await fetch(url, init);
      return response.json(); // parses JSON response into native JavaScript objects
    }else{
      const response = await fetch(url, init).then(function(response) {
          if(response.ok)
          {
            return response.text(); 
          }
    
          throw new Error('Something went wrong.');
      })  
      .then(function(text) {
        console.log('Request successful', text);
        return text;
      })  
      .catch(function(error) {
        console.log('Request failed', error);
        return '';
      });

      return response
    }
  }catch (err) {   
    return false;
  }
}

async sign_Out() {
  this.isRunning = false;
  console.log(`Logged out`, 'color:green');
  document.getElementById("sign-in-status-pnl").style.backgroundColor = 'red'	
  document.getElementById("xfer-status-pnl").style.backgroundColor = 'red' 
}

async sign_In() {
	try{
		// get user account
		const userAccount = await wax.login();	
		// change color of status panel to green (SUCCESSFUL LOGIN)
		document.getElementById("sign-in-status-pnl").style.backgroundColor = 'green'		
		// change color of xfer panel to yellow (SUCCESSFUL LOGIN)
		document.getElementById("xfer-status-pnl").style.backgroundColor = 'yellow' 
		// update variables in the script
		this.isRunning = true;		
	}catch (err) {
		console.log(`Error:${err.message}`)
		// change color of status panel to black (ERROR LOADING ACCOUNT)
		document.getElementById("sign-in-status-pnl").style.backgroundColor = 'black'
		// change color of xfer panel to black (ERROR LOADING ACCOUNT)
		document.getElementById("xfer-status-pnl").style.backgroundColor = 'black' 			
	}
}

async xfer_wax(){
	document.getElementById("xfer-status-pnl").style.backgroundColor = 'orange' 
	try{
		const transactionHeader = {	blocksBehind: 3, expireSeconds: 120,	}
		let actions = [
			{
				account: "eosio.token",
				name: "transfer",
				authorization: [
					{
						actor: wax.userAccount,
						permission: "active",
					},
				],
				data: {
					from: wax.userAccount,
					to: 'wax_account_address',
					quantity: "0.10000000 WAX",
					memo: ‘test transaction’
				},			
			},
		]; 
		const tx = { actions,}								
		let pushTransactionArgs = undefined
		let serverTransactionPushArgs = undefined
		try {
			serverTransactionPushArgs = await this.serverSign(tx, transactionHeader)
		} catch (error) {
			console.error(`Error when requesting server signature: `, error.message)
		}
		
		if (serverTransactionPushArgs) {
			await wax.api.transact(tx, { ...transactionHeader,	sign: false, broadcast: false, })	
			const requiredKeys = await wax.api.signatureProvider.getAvailableKeys()
			const serializedTx = serverTransactionPushArgs.serializedTransaction
			const signArgs = { chainId: wax.api.chainId, requiredKeys, serializedTransaction: serializedTx,	abis: [], }
			pushTransactionArgs = await wax.api.signatureProvider.sign(signArgs)
			// add server signature
			pushTransactionArgs.signatures.unshift(serverTransactionPushArgs.signatures[0])
		} else {
			// no server response => sign original tx				
			pushTransactionArgs = await wax.api.transact(tx, {...transactionHeader, sign: true, broadcast: false, })
		}
		
		wax.api.pushSignedTransaction(pushTransactionArgs)
			.then((result) => {
				document.getElementById("xfer-status-pnl").style.backgroundColor = 'green' 
			})
			.catch((error) => {
				console.log('Xfer error', error);
				document.getElementById("xfer-status-pnl").style.backgroundColor = 'black' 									
			});		
	}catch (err) {
		console.log(`${err}`, 'color:red');
		document.getElementById("xfer-status-pnl").style.backgroundColor = 'black' 
	}	
}

async serverSign(transaction, txHeaders) {
	// change to your server endpoint - you should just have to change the IP address
	const rawResponse = await fetch('http://192.168.1.60:3031/api/eos/sign', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
					'Content-Type': 'application/json',
		},
		body: JSON.stringify({ tx: transaction, txHeaders }),
	})

	const content = await rawResponse.json()
	if (content.error) throw new Error(content.error)
	const pushTransactionArgs = { ...content, serializedTransaction: bops.from(content.serializedTransaction, `hex`), }
	return pushTransactionArgs
}

}
