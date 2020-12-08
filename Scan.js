import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import ImagePicker from "react-native-image-picker";

import Amplify, { API, Storage } from "aws-amplify";
import config from "./aws-exports";
Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
});
import { withAuthenticator } from "aws-amplify-react-native";

const Scan = ({ navigation }) => {
  const [image, setImage] = useState(null);
  // data from DynamoDB when there is a match
  const [data, setData] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(()=> {
      if(image && matches !== null) {
        const title = image.split('/').slice(-1).toString();
        // uploadToStorage(image, title);
        // depending on the match result, may need to pass different parameters
        navigation.navigate('Profile', { image, title, matches, data })
      }
    }, [image, matches])

  // upload the image to S3 for either create a collection or to search the image in collections
//   async function uploadToStorage (pathToImageFile, title) {
//     try {
//       const response = await fetch(pathToImageFile);
//       const blob = await response.blob();
//       Storage.put(title, blob, {
//         contentType: 'image/jpeg',
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   };

  //searchFacesbyImage method

  //if match a get data call should be made here

  function selectImage () {
    let options = {
      title: "You can choose one image",
      maxWidth: 256,
      maxHeight: 256,
      storageOptions: {
        skipBackup: true,
      },
    };

    ImagePicker.showImagePicker(options, async (response) => {
      console.log({ response });

      if (response.didCancel) {
        console.log("User cancelled photo picker");
        Alert.alert("You did not select any image");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {

        const uri = response.uri;
        const uriParts = uri.split(".");
        let fileType = uriParts[uriParts.length - 1];
        let formData = new FormData();
        formData.append("photo", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });

        let options = {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        };

        const fetchResult = await fetch(
          `http://192.168.1.17:8080/api/upload/`,
          // "http://localhost:8080/api/upload",
          options
        );
        const data = await fetchResult.json();
        setMatches(data);
        console.log(data);
        setImage(response.uri);
      }
    });
  }

 // keep the image and match parts for testing
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TouchableOpacity onPress={selectImage}>
        <Text>Scan</Text>
      </TouchableOpacity>
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      {matches && (
        <Text>
          {matches.length} Matches, First Match:{" "}
          {matches.length && matches[0].Face.ImageId}
        </Text>
      )}
    </View>
  );
};
export default withAuthenticator(Scan);
