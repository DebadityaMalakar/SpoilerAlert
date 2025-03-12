import torch
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import io
import torchvision.transforms as transforms
import torchvision.models as models
import base64

app = FastAPI()

# 🔥 Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Load Model (MobileNetV2)
model = models.mobilenet_v2(pretrained=False)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = torch.nn.Linear(num_ftrs, 2)  
model.load_state_dict(torch.load("model.pt", map_location=torch.device("cpu")))
model.eval()

# 🔥 Image Preprocessing Function
def transform_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return transform(image).unsqueeze(0)

class ImageRequest(BaseModel):
    image: str  # Base64 image string

# 🔥 POST Endpoint
@app.post("/predict/")
async def predict(request: ImageRequest):
    try:
        image_bytes = base64.b64decode(request.image)
        input_tensor = transform_image(image_bytes)

        with torch.no_grad():
            output = model(input_tensor)
            predicted_class = torch.argmax(torch.nn.functional.softmax(output[0], dim=0)).item()

        return {"predicted_class": predicted_class}
   
    except Exception as e:
        return {"error": str(e)}
