import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import 'semantic-ui-css/semantic.min.css';
import {
  Segment,
  Container,
  Card,
  Icon,
  Image,
  Button,
  Form,
  Modal,
  Header
} from 'semantic-ui-react';
import netlifyIdentity from 'netlify-identity-widget';
import axios from 'axios';
import blank from './img/blank-avatar.jpg';

const StyledHeading = styled.h2``;
const StyledPara = styled.p``;

const OuterBody = styled.div`
  margin-top: 5rem;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
`;
const StyledBody = styled.div`
  display: grid;
  width: 90vw;
  justify-self: center;
  grid-template-columns: 1fr;
  grid-template-rows: 2rem 1fr
  justify-items: center;
`;

const StyledClickMeImage = styled(Image)`
  &:hover {
    cursor: pointer;
  }
`;

const Home = props => {
  window.netlifyIdentity = netlifyIdentity;
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(blank);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  netlifyIdentity.on('login', user => setIsLoggedIn(true));
  useEffect(() => {
    console.log('sure');
    netlifyIdentity.init();
    if (localStorage.getItem('gotrue.user')) {
      netlifyIdentity
        .currentUser()
        .jwt()
        .then(jwt => {
          setIsLoggedIn(true);
          setEmail(netlifyIdentity.currentUser().email);
        })
        .catch(err => {
          console.log(err);
        });
      console.log(netlifyIdentity.currentUser());
    }
  }, [isLoggedIn]);

  const openAuthModal = () => netlifyIdentity.open();
  const onImageSelected = () => {
    setShowModal(true);
  };
  const updateUser = async details => {
    try {
      const response = await axios.post(
        '/.netlify/functions/post-user-details/',
        JSON.stringify(details),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (error) {
      return error;
    }
  };
  const uploadImage = async () => {
    try {
      const image = fileInputRef.current.files[0];
      if (image.size > 5242880){
        throw new Error("This file is too big, has to be less than 5mb")
      }
      const response = await axios.post(
        '/.netlify/functions/get-upload-url/',
        JSON.stringify({ fileName: image.name, type: image.type })
      );
      console.log(response.data.uploadUrl);
      const uploadRes = await axios.put(response.data.uploadUrl, image, {
        headers: {
          'Content-Type': image.type
        }
      });
      const saveUrl = await updateUser({
        IdentityID: netlifyIdentity.currentUser().id,
        Email: netlifyIdentity.currentUser().email,
        AvatarUrl: response.data.publicUrl
      });
      console.log(saveUrl);
      setAvatarUrl(response.data.publicUrl);
      setShowModal(false);
      console.log(uploadRes);
    } catch (err) {
      console.log(err);
    }
  };

  const saveAddress = () => {
    if (address.length > 5) {
      updateUser({
        IdentityID: netlifyIdentity.currentUser().id,
        Email: netlifyIdentity.currentUser().email,
        Address: address
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.post(
          '/.netlify/functions/get-user-details/',
          JSON.stringify({
            IdentityID: netlifyIdentity.currentUser().id
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data != null){ 
       
        if (response.data.Address) {
          setAddress(response.data.Address);
        }
        if (response.data.AvatarUrl) {
          setAvatarUrl(response.data.AvatarUrl);
        }

        if (response.data.Email) {
          setEmail(response.data.Email);
        }
      }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [avatarUrl, email, isLoggedIn]);

  return (
    <>
      <OuterBody>
        <StyledBody>
          <Container>
            <Segment>
              <StyledHeading>Welcome to my simple profile demo!</StyledHeading>
              <StyledPara>
                Here, you should login then upload a profile picture, and set
                your address (use a fake one).
              </StyledPara>
              {isLoggedIn ? (
                <>
                  <Card>
                    <form>
                      <label>
                        <input
                          type="file"
                          name="pic"
                          accept="image/*"
                          onChange={e => {
                            console.log(fileInputRef.current.files[0]);
                            onImageSelected();
                            console.log(e);
                          }}
                          ref={fileInputRef}
                          hidden
                        />
                        <StyledClickMeImage
                          src={avatarUrl}
                          //onClick={() => }
                        />
                      </label>
                    </form>

                    <Card.Content>
                      <Card.Header>Email:{email} </Card.Header>

                      <Card.Description>
                        {address ? `Address: ${address}` : ''}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <a href="#">
                        <Icon name="user" />
                        22 Friends
                      </a>
                    </Card.Content>
                  </Card>
                  confirm?
                  <Form>
                    <Form.Field>
                      <label>First Name</label>
                      <input
                        placeholder="Address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                      />
                    </Form.Field>
                    <Button
                      type="Save Address to my profile"
                      onClick={saveAddress}
                    >
                      Save my address!
                    </Button>
                  </Form>
                  <br />
                  <Button
                    content="Log me out, log me out!"
                    icon="key"
                    labelPosition="left"
                    onClick={() => netlifyIdentity.open()}
                  />
                </>
              ) : (
                <Button
                  content="Hey friend, let's authenticate."
                  icon="key"
                  labelPosition="left"
                  onClick={openAuthModal}
                />
              )}
            </Segment>
            <Modal open={showModal} basic size="small">
              <Header icon="cloud upload" content="Save profile image" />
              <Modal.Content>
                <p>Are you sure you want to upload this image?</p>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  basic
                  color="red"
                  onClick={() => setShowModal(false)}
                  inverted
                >
                  <Icon name="remove" /> No
                </Button>
                <Button color="green" onClick={uploadImage} inverted>
                  <Icon name="checkmark" /> Yes
                </Button>
              </Modal.Actions>
            </Modal>
          </Container>
        </StyledBody>
      </OuterBody>
    </>
  );
};

export default Home;
