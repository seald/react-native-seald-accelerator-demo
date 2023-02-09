/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Button, View, Text,
} from 'react-native';


import DocumentPicker, {
  isInProgress
} from 'react-native-document-picker'
import { FileSystem } from 'react-native-file-access';

import { encryptString, decryptString, encryptURI, decryptURI } from '@seald-io/react-native-accelerator';
import SealdSDK from '@seald-io/sdk/react-native/seald-sdk-react-native.bundle.js';

import { apiURL, appId, JWTSharedSecret } from './credentials';

const App = () => {
  const [sealdSDK, setSealdSDK] = React.useState(null);
  const [encryptionSession, setES] = React.useState(null);

  const [disable, setDisable] = React.useState(true);
  React.useEffect(() => {
    const initSDK = async () => {
      // Instanciate an SDK instance
      const sdk = SealdSDK({appId, apiURL})
      const signupJWT = await sdk.utils.generateRegistrationJWT(JWTSharedSecret.key, JWTSharedSecret.id, {joinTeam: true})
      await sdk.initiateIdentity({signupJWT})

      // Create an encryption session for which we will encrypt files and documents
      const recipients = {} // Current user is added by default. There will be no other recipients
      const es = await sdk.createEncryptionSession(recipients)
      setES(es)
      setSealdSDK(sdk)

      // Now that the initialization is finished, we can enable tests functions.
      setDisable(false)
    }
    initSDK()
  }, []);

  // Helper function to select a document to encrypt/decrypt
  const selectDocument = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      })
      return pickerResult
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.warn('cancelled')
        // User cancelled the picker, exit any dialogs or menus and move on
      } else if (isInProgress(err)) {
        console.warn('multiple pickers were opened, only the last will be considered')
      } else {
        throw err
      }
    }
    return
  }

  // Demo function that show how to encrypt/decrypt a string
  const encryptDecryptAsString = async () => {
    const filename = 'myFilename.ext'
    let fileContent = 'File data as string.'

    const encryptedFile = await encryptString(fileContent, filename, encryptionSession)

    // Decrypt the encrypted string:
    const clearFile = await decryptString(encryptedFile, encryptionSession)
    console.log('clearFile.filename', clearFile.filename)
    console.log('clearFile.fileContent', clearFile.fileContent)
  }

  // Demo function that show how to encrypt a file from its URI
  const encrypt = async () => {
    const selectedFile = await selectDocument()
    if (selectedFile) {
      console.log('Starting encryption...')
      const encryptedFileUri = await encryptURI(selectedFile.fileCopyUri, selectedFile.name, encryptionSession)
      console.log('File encryption finished!', encryptedFileUri)

      // Copy the file outside the app sandbox, so we can easily pick it in with documentPicker
      await FileSystem.cpExternal(encryptedFileUri, `${selectedFile.name}.seald`, 'downloads')
    }
  }

  // Demo function that show how to decrypt a file from its URI
  const decrypt = async () => {
    const selectedFile = await selectDocument()
    if (selectedFile) {
      console.log('Starting decryption...')
      const decryptedFileObject = await decryptURI(selectedFile.fileCopyUri, encryptionSession)
      console.log('decryption finished!', decryptedFileObject)
      await FileSystem.cpExternal(decryptedFileObject.path, decryptedFileObject.filename, 'downloads')
    }
  }

  // Demonstration function illustrating performance gains
  const comparisonTest = async () => {
    const selectedFile = await selectDocument()
    if (selectedFile) {
      const start = performance.now()
      await encryptURI(selectedFile.fileCopyUri, selectedFile.name, encryptionSession)
      const end = performance.now()
      console.log('accelerator encryption time', end - start)

      const read0 = performance.now()
      const fileAsString = await FileSystem.readFile(selectedFile.fileCopyUri)
      const read1 = performance.now()

      const esEnc0 = performance.now()
      const encryptedFile = await encryptionSession.encryptFile(fileAsString, selectedFile.name)
      const esEnc1 = performance.now()

      const write0 = performance.now()
      await FileSystem.writeFile(selectedFile.fileCopyUri, encryptedFile)
      const write1 = performance.now()
      console.log('FS read duration', read1 - read0)
      console.log('default encryption duration', esEnc1 - esEnc0 + 'ms')
      console.log('FS write duration', write1 - write0)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      { disable &&
          <Text>
            Initializing Seald SDK...
          </Text>
      }
      { !disable &&
          <View>
            <Button
                title="File as String"
                onPress={encryptDecryptAsString}
            />
            <Button
                title="encrypt URI"
                onPress={encrypt}
            />
            <Button
                title="decrypt URI"
                onPress={decrypt}
            />
            <Button
                title="comparison"
                onPress={comparisonTest}
            />
          </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default App;
