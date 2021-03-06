import firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { Text, StyleSheet, Platform } from 'react-native'
import {
  Button,
  Container,
  Form,
  Textarea,
  Content,
  Input,
  Item,
  Header,
  Left,
  Body,
  Title,
  Right,
} from 'native-base'
import { Subscribe } from 'unstated'
import { useNavigation, useRoute } from '@react-navigation/native'

/* components */
import PhotoPreview from '../components/PhotoPreview'

/* stores */
import AuthUserStore from '../stores/AuthUserStore';
import CollectionsStore from '../stores/CollectionsStore'

const PostScreenContainer = () => {
  return (
    <Subscribe to={[AuthUserStore, CollectionsStore]}>
      {(authUserStore, collectionsStore) => (
        <PostScreen
          authUserStore={authUserStore}
          collectionsStore={collectionsStore}
        />
      )}
    </Subscribe>
  )
}

const PostScreen = (props) => {
  const navigation = useNavigation()
  const route = useRoute()
  const collection = route.params && route.params.collection

  const [name, setName] = useState(collection ? collection.name : "")
  const [description, setDescription] = useState(collection ? collection.description : "")
  const [photo, setPhoto] = useState(collection ? collection.photo : "")

  const {
    authUserStore,
    collectionsStore
  } = props

  const resetForm = () => {
    setName("")
    setDescription("")
    setPhoto("")
  }

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync()

      if (status !== "granted") {
        alert("not granted");
        return
      }
    }

    const data = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All
    })

    if (data.cancelled) {
      return
    }

    if (!data.uri) {
      return
    }

    setPhoto(data.uri);
  };

  const onPressSaveButton = () => {
    if (name === "" || description == "") return
    let alertText = "登録しました"
    const userId = authUserStore.state.user.id

    if (collection) {
      alertText = "更新しました"
      const updateCollection = {
        id: collection.id,
        name,
        description,
        photo,
        likeCount: collection.likeCount,
        updatedAt: firebase.firestore.Timestamp.now()
      }
      collectionsStore.updateCollection(userId, updateCollection)
    } else {
      const newCollection = {
        name,
        description,
        photo,
        likeCount: 0,
        createdAt: firebase.firestore.Timestamp.now()
      }
      collectionsStore.addCollection(userId, newCollection)
    }
    resetForm()
    navigation.navigate("Home")
    alert(alertText)
  }

  return (
    <Container>
      {collection ? (
        <></>
      ) : (
        <Header>
          <Left/>
          <Body>
            <Title>新規登録</Title>
          </Body>
          <Right/>
        </Header>
      )}
      <Content padder>
        <Form>
          <PhotoPreview
            photo={photo}
            pickImage={pickImage}
          />
          <Item regular style={styles.name}>
            <Input
              placeholder='タイトル'
              defaultValue={name}
              onChangeText={(text) => setName(text)}
            />
          </Item>
          <Textarea
            rowSpan={5}
            bordered
            placeholder="説明文"
            defaultValue={description}
            style={styles.description}
            onChangeText={(text) => setDescription(text)}
          />
          <Button
            block
            warning
            style={styles.saveButton}
            onPress={() => onPressSaveButton()}
          >
            <Text style={styles.saveButtonText}>{collection ? "更新する" : "登録する"}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  name: {
    marginTop: 8
  },
  description: {
    marginTop: 15
  },
  saveButton: {
    marginTop: 15,
  },
  saveButtonText: {
    color: "#fff",
  },
});

export default PostScreenContainer
