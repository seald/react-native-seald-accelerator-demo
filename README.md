
This project example aims to illustrate the use of the Seald SDK and the `react-native-accelerator` plugin in a react native application.
For more information, please refer to this [documentation](https://docs.seald.io/sdk/).

# Run the demo

To use the Seald SDK, you will need credentials. Follow this [documentation](https://docs.seald.io/sdk/guides/1-quick-start.html#pre-requis) to get your API tokens. 
In `src` folder, create a `credentials.ts` file, with the same structure as `credentials.template.ts`. File the given template with the values from your dashboard.

```bash
yarn install

yarn run android
yarn run ios
```



# Code explanation


import Seald SDK, and accelerator functions:
```js
import SealdSDK from '@seald-io/sdk/react-native/seald-sdk-react-native.bundle.js';
import { encryptString, decryptString, encryptURI, decryptURI } from '@seald-io/react-native-accelerator'
```

Import SDK credentials
```js
import { apiURL, appId, JWTSharedSecret } from './credentials';
```

Instantiate SDK, generate registration token, initiate a Seald identity:
```js
const sealdSDK = SealdSDK({appId, apiURL})

// JWTSharedSecret is a secret and should NEVER be sent to the client.
// The license JWT should be provided by your backend, at login/signup.
const signupJWT = await sealdSDK.utils.generateRegistrationJWT(JWTSharedSecret.key, JWTSharedSecret.id, {joinTeam: true})

await sealdSDK.initiateIdentity({signupJWT})
```

Create an encryption session
```js
const recipients = {} // Current user is added by default. There will be no other recipients
encryptionSession = await sealdSDK.createEncryptionSession(recipients)
```

Set the SDK instance, and the encryption session instance in app store
```js
setES(es)
setSealdSDK(sdk)
```

Accelerator functions are used in demo functions:
```js
const encryptedFileUri = await encryptURI(FILE_URI, FILENAME, encryptionSession)
const decryptedFileObject = await decryptURI(FILE_URI, encryptionSession)

const encryptedFile = await encryptString(FILE_CONTENT, FILENAME, encryptionSession)
const clearFileObject = await decryptString(ENCRYPTED_FILE_CONTENT, encryptionSession)
```

