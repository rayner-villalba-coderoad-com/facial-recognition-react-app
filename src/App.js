import { useState } from 'react';
import './App.css';
const uuid = require('uuid');


function App() {
  const [image, setImage] = useState('');
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate');
  const [imageName, setImageName] = useState('placeholder.jpg');
  const [isAuth, setIsAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault();
    setImageName(image.name);

    const visitorImageName = uuid.v4();

    //Define API Gateway endpoint
    const url = 'https://k3mr9yfg28.execute-api.us-east-1.amazonaws.com/dev';
    const bucket = 'upb-visitor-image-storage';

    fetch(`${url}/${bucket}/${visitorImageName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*'
      },
      body: image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      if (response.Message ==='Success') {
        setIsAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, welcome to UPB`)
      } else {
        setIsAuth(false);
        setUploadResultMessage('Authentication Failed!!!')
      }
    }).catch(error => {
      setIsAuth(false);
      setUploadResultMessage('Failed process of authentication. Please try again');
      console.error(error);
    })
  }

  async function authenticate(visitorImageName) {
    const requestUrl = 'https://k3mr9yfg28.execute-api.us-east-1.amazonaws.com/dev/employee?' + new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });

    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(resp => resp.json())
    .then(data => {
      return data;
    }).catch(error => console.error(error))
  }
  
  return (
    <div className="App">
      <h2>UPB Facial Recognition System</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])}></input>
        <button type='submit'>Authenticate</button>  
      </form>
      <div className={isAuth ? 'success' : 'failure' }>{uploadResultMessage}</div>
      <img src={ require(`./visitors/${imageName}`)} alt='Visitor' height={250} width={250} />
    </div>
  );
}

export default App;
