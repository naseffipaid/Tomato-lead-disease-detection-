from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import requests

app = FastAPI()

load_model =  tf.keras.models.load_model
endpoint = "http://localhost:8501/v1/models/tomato_model:predict"

CLASS_NAMES = ['Tomato___Bacterial_spot',
 'Tomato___Early_blight',
 'Tomato___Late_blight',
 'Tomato___Leaf_Mold',
 'Tomato___Septoria_leaf_spot',
 'Tomato___Spider_mites Two-spotted_spider_mite',
 'Tomato___Target_Spot',
 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
 'Tomato___Tomato_mosaic_virus',
 'Tomato___healthy']

@app.get('/ping')
async def ping():
    return 'How are you'

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post('/predict')
async def predict(
    file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    image_batch = np.expand_dims(image,0)

    json_data = {
        "instances":image_batch.tolist()
    }

    response = requests.post(endpoint,json=json_data)
    # print(response.json())
    prediction = response.json()['predictions'][0]

    type_of_disease = CLASS_NAMES[np.argmax(prediction)]
    confidence = float(np.max(prediction))
    return {
        'class':type_of_disease,
        'confidence':confidence
    }

    

if __name__ == '__main__':
    uvicorn.run(app,host='localhost',port=8000)