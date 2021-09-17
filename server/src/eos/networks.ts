import { JsonRpc } from 'eosjs';
import fetch from 'node-fetch'

export type TEOSNetwork = {
  chainId: string;
  nodeEndpoint: string;
  protocol: string;
  host: string;
  port: number;
};

const createNetwork = (nodeEndpoint: string, chainId: string): TEOSNetwork => {
  const matches = /^(https?):\/\/(.+):(\d+)\D*$/.exec(nodeEndpoint);
  if (!matches) {
    throw new Error(
      `Could not parse EOS HTTP endpoint. Needs protocol and port: "${nodeEndpoint}"`,
    );
  }

  const [, httpProtocol, host, port] = matches;

  return {
    chainId,
    protocol: httpProtocol,
    host,
    port: Number.parseInt(port, 10),
    nodeEndpoint,
  };
};

const JungleNetwork: TEOSNetwork = createNetwork(
  `https://jungle2.cryptolions.io:443`,
  `e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473`,
);
const KylinNetwork: TEOSNetwork = createNetwork(
  `https://kylin-dsp-2.liquidapps.io:443`,
  `5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191`,
);

const MainNetwork: TEOSNetwork = createNetwork(
  `https://eos.greymass.com:443`,
  `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`,
);

const WaxNetwork: TEOSNetwork = createNetwork(
	`https://api.waxsweden.org:443`,
	`1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4`,
)

function getNetworkName() {
  return `waxnetwork`
}

function getNetwork() {
  const eosNetwork = getNetworkName()

  switch (eosNetwork) {
    case `jungle`:
		return JungleNetwork;
    case `kylin`:
		return KylinNetwork;
	case `mainnet`:
		return MainNetwork;
    default:
    case `waxnetwork`:
		return WaxNetwork;
	
  }
}

const network = getNetwork();

const rpc = new JsonRpc(network.nodeEndpoint, { fetch: fetch as any });

export { getNetwork, getNetworkName, rpc };