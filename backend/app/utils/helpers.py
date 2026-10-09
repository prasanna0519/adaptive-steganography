import io
import base64
import numpy as np
from PIL import Image
import cv2
from typing import Tuple
from fastapi import UploadFile, HTTPException

async def read_image_from_upload(file: UploadFile) -> Tuple[np.ndarray, str]:
    """Reads uploaded file bytes and converts to RGB uint8 numpy array and format string."""
    try:
        content = await file.read()
        pil_img = Image.open(io.BytesIO(content))
        img_format = pil_img.format.upper() if pil_img.format else "PNG"
        
        rgb_img = pil_img.convert("RGB")
        img_np = np.array(rgb_img, dtype=np.uint8)
        
        return img_np, img_format
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to process image file: {str(e)}")

def decode_base64_image(b64_str: str) -> np.ndarray:
    """Decodes base64 data string to RGB numpy array."""
    try:
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
        img_bytes = base64.b64decode(b64_str)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        return np.array(pil_img, dtype=np.uint8)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")

def np_to_base64_png(arr: np.ndarray) -> str:
    """Converts numpy array to base64 PNG data URL."""
    pil_img = Image.fromarray(arr.astype(np.uint8))
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{b64_str}"
