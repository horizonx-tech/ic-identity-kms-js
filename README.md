# ic-identity-kms-js

This is a Javascript implementation of the Identity Key Management Service (KMS) for the Internet Computer. This implements the `SignIdentity` of `@dfinity/agent` .

## Installation

```
yarn add @horizonx/aptos-wallet-connector
```

or

```
npm install @horizonx/aptos-wallet-connector
```


## Usage

```typescript
import { KMSClient } from "@aws-sdk/client-kms";
import { KmsIdentity } from "@horizonx/ic-identity-kms-js";

export const handler = async () => {
  const identity = await KmsIdentity.from(new KMSClient(), "alias/sample-key");

  const agent = new HttpAgent({ host: "https://ic0.app", identity });
  agent.call("caniserId", {
    methodName: "methodName",
    arg: IDL.encode([IDL.Text], ["arg"]), 
  });
}
```