import { AxiosResponse } from "axios";
import config from "config";
import RpcMethod from "iotex-antenna/lib/rpc-method/node-rpc-method";
// @ts-ignore
import { Config, Server } from "onefx/lib/server";
import { AntennaResolver } from "../api-gateway/resolvers/antenna";
import { MetaResolver } from "../api-gateway/resolvers/meta";
import { SolcResolver } from "../api-gateway/resolvers/solc";
import {
  AddressResolver,
  TokenMetaResolver
} from "../api-gateway/resolvers/token";
import { setModel } from "../model";
import "../shared/common/setup-big-number";
import { analytics } from "./gateways/analytics";
import { setGateways } from "./gateways/gateways";
import { setMiddleware } from "./middleware";
import { setServerRoutes } from "./server-routes";

export type MyServer = Server & {
  resolvers: Array<
    | typeof MetaResolver
    | typeof AntennaResolver
    | typeof SolcResolver
    | typeof AddressResolver
    | typeof TokenMetaResolver
  >;
  model: {};
  gateways: {
    antenna: RpcMethod;
    coinmarketcap: { fetchCoinPrice(): Promise<AxiosResponse> };
    analytics: typeof analytics;
    sendgrid: {};
  };
  config: MyConfig;
  // tslint:disable-next-line:no-any
  auth: any;
};

export type MyConfig = Config & {
  gateways: {
    iotexAntenna: string;
    sendgrid: {};
    chainID: number
  };
  bidContractAddress: string;
  vitaTokens: object;
  multiChain: object;
  defaultERC20Tokens: object;
  webBpApiGatewayUrl: string;
  enableSignIn: boolean;
  toEthAddress: boolean;
  apiGatewayUrl: string;
  analyticsApiGatewayUrl: string;
  siteVersion: string;
};

const defaultConfig: Config = {
  project: "",
  server: {
    host: "",
    port: "",
    staticDir: "",
    delayInitMiddleware: false,
    cookie: {
      secrets: []
    },
    noSecurityHeadersRoutes: {},
    noCsrfRoutes: {}
  },
  gateways: {
    logger: {
      enabled: false,
      baseDir: "",
      topicName: "",
      level: "debug"
    }
  },
  csp: {},
  analytics: {},
  session: {}
};
const serverConfig: Config = {
  ...defaultConfig,
  ...config
};

export async function startServer(): Promise<MyServer> {
  const server = new Server(serverConfig as MyConfig) as MyServer;
  server.app.proxy = Boolean(config.get("server.proxy"));
  setGateways(server);
  setMiddleware(server);
  setModel(server);
  setServerRoutes(server);

  const defaultPort = process.env.PORT || "4004";
  const port = Number(defaultPort) || config.get("server.port");

  server.listen(port);
  return server;
}
