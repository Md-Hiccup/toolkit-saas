from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.utils.encoder_helpers import *

router = APIRouter(prefix="/encoder", tags=["Encoder/Decoder"])

class EncodeRequest(BaseModel):
    text: str
    secret: Optional[str] = None
    algorithm: Optional[str] = "HS256"
    indent: Optional[int] = None
    paragraphs: Optional[int] = 3
    use_lorem: Optional[bool] = False

class EncodeResponse(BaseModel):
    result: str

# JWT Endpoints
@router.post("/jwt/encode", response_model=EncodeResponse)
async def jwt_encode_endpoint(request: EncodeRequest):
    """Encode JWT token"""
    try:
        import json
        payload = json.loads(request.text)
        if not request.secret:
            raise HTTPException(status_code=400, detail="Secret key is required for JWT encoding")
        result = encode_jwt(payload, request.secret, request.algorithm)
        return EncodeResponse(result=result)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/jwt/decode", response_model=EncodeResponse)
async def jwt_decode_endpoint(request: EncodeRequest):
    """Decode JWT token"""
    try:
        if not request.secret:
            raise HTTPException(status_code=400, detail="Secret key is required for JWT decoding")
        result = decode_jwt(request.text, request.secret, request.algorithm)
        import json
        return EncodeResponse(result=json.dumps(result, indent=2))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JWT token: {str(e)}")

# Base32 Endpoints
@router.post("/base32/encode", response_model=EncodeResponse)
async def base32_encode_endpoint(request: EncodeRequest):
    """Encode to Base32"""
    try:
        result = encode_base32(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/base32/decode", response_model=EncodeResponse)
async def base32_decode_endpoint(request: EncodeRequest):
    """Decode from Base32"""
    try:
        result = decode_base32(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Base32: {str(e)}")

# Base64 Endpoints
@router.post("/base64/encode", response_model=EncodeResponse)
async def base64_encode_endpoint(request: EncodeRequest):
    """Encode to Base64"""
    try:
        result = encode_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/base64/decode", response_model=EncodeResponse)
async def base64_decode_endpoint(request: EncodeRequest):
    """Decode from Base64"""
    try:
        result = decode_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Base64: {str(e)}")

# URL Base64 Endpoints
@router.post("/url-base64/encode", response_model=EncodeResponse)
async def url_base64_encode_endpoint(request: EncodeRequest):
    """Encode to URL-safe Base64"""
    try:
        result = encode_url_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url-base64/decode", response_model=EncodeResponse)
async def url_base64_decode_endpoint(request: EncodeRequest):
    """Decode from URL-safe Base64"""
    try:
        result = decode_url_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid URL Base64: {str(e)}")

# MIME Base64 Endpoints
@router.post("/mime-base64/encode", response_model=EncodeResponse)
async def mime_base64_encode_endpoint(request: EncodeRequest):
    """Encode to MIME Base64"""
    try:
        result = encode_mime_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mime-base64/decode", response_model=EncodeResponse)
async def mime_base64_decode_endpoint(request: EncodeRequest):
    """Decode from MIME Base64"""
    try:
        result = decode_mime_base64(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid MIME Base64: {str(e)}")

# URL Encoding Endpoints
@router.post("/url/encode", response_model=EncodeResponse)
async def url_encode_endpoint(request: EncodeRequest):
    """URL encode text"""
    try:
        result = url_encode(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url/decode", response_model=EncodeResponse)
async def url_decode_endpoint(request: EncodeRequest):
    """URL decode text"""
    try:
        result = url_decode(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# HTML Encoding Endpoints
@router.post("/html/encode", response_model=EncodeResponse)
async def html_encode_endpoint(request: EncodeRequest):
    """HTML encode text"""
    try:
        result = html_encode(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/html/decode", response_model=EncodeResponse)
async def html_decode_endpoint(request: EncodeRequest):
    """HTML decode text"""
    try:
        result = html_decode(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Unicode Endpoints
@router.post("/unicode/escape", response_model=EncodeResponse)
async def unicode_escape_endpoint(request: EncodeRequest):
    """Unicode escape text"""
    try:
        result = unicode_escape(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/unicode/unescape", response_model=EncodeResponse)
async def unicode_unescape_endpoint(request: EncodeRequest):
    """Unicode unescape text"""
    try:
        result = unicode_unescape(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Hashing Endpoints
@router.post("/hash/md5", response_model=EncodeResponse)
async def hash_md5_endpoint(request: EncodeRequest):
    """Generate MD5 hash"""
    result = hash_md5(request.text)
    return EncodeResponse(result=result)

@router.post("/hash/sha1", response_model=EncodeResponse)
async def hash_sha1_endpoint(request: EncodeRequest):
    """Generate SHA1 hash"""
    result = hash_sha1(request.text)
    return EncodeResponse(result=result)

@router.post("/hash/sha256", response_model=EncodeResponse)
async def hash_sha256_endpoint(request: EncodeRequest):
    """Generate SHA256 hash"""
    result = hash_sha256(request.text)
    return EncodeResponse(result=result)

@router.post("/hash/sha512", response_model=EncodeResponse)
async def hash_sha512_endpoint(request: EncodeRequest):
    """Generate SHA512 hash"""
    result = hash_sha512(request.text)
    return EncodeResponse(result=result)

# HMAC Endpoints
@router.post("/hmac/md5", response_model=EncodeResponse)
async def hmac_md5_endpoint(request: EncodeRequest):
    """Generate HMAC-MD5"""
    if not request.secret:
        raise HTTPException(status_code=400, detail="Secret key is required for HMAC")
    result = hmac_md5(request.text, request.secret)
    return EncodeResponse(result=result)

@router.post("/hmac/sha1", response_model=EncodeResponse)
async def hmac_sha1_endpoint(request: EncodeRequest):
    """Generate HMAC-SHA1"""
    if not request.secret:
        raise HTTPException(status_code=400, detail="Secret key is required for HMAC")
    result = hmac_sha1(request.text, request.secret)
    return EncodeResponse(result=result)

@router.post("/hmac/sha256", response_model=EncodeResponse)
async def hmac_sha256_endpoint(request: EncodeRequest):
    """Generate HMAC-SHA256"""
    if not request.secret:
        raise HTTPException(status_code=400, detail="Secret key is required for HMAC")
    result = hmac_sha256(request.text, request.secret)
    return EncodeResponse(result=result)

@router.post("/hmac/sha512", response_model=EncodeResponse)
async def hmac_sha512_endpoint(request: EncodeRequest):
    """Generate HMAC-SHA512"""
    if not request.secret:
        raise HTTPException(status_code=400, detail="Secret key is required for HMAC")
    result = hmac_sha512(request.text, request.secret)
    return EncodeResponse(result=result)

# JSON Formatting Endpoints
@router.post("/json/format", response_model=EncodeResponse)
async def json_format_endpoint(request: EncodeRequest):
    """Format JSON"""
    try:
        indent = request.indent if request.indent is not None else 2
        result = format_json(request.text, indent)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

@router.post("/json/minify", response_model=EncodeResponse)
async def json_minify_endpoint(request: EncodeRequest):
    """Minify JSON"""
    try:
        result = minify_json(request.text)
        return EncodeResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

# Text Case Endpoints
@router.post("/text/upper", response_model=EncodeResponse)
async def text_upper_endpoint(request: EncodeRequest):
    """Convert to uppercase"""
    result = text_to_upper(request.text)
    return EncodeResponse(result=result)

@router.post("/text/lower", response_model=EncodeResponse)
async def text_lower_endpoint(request: EncodeRequest):
    """Convert to lowercase"""
    result = text_to_lower(request.text)
    return EncodeResponse(result=result)

@router.post("/text/title", response_model=EncodeResponse)
async def text_title_endpoint(request: EncodeRequest):
    """Convert to title case"""
    result = text_to_title(request.text)
    return EncodeResponse(result=result)

@router.post("/text/reverse", response_model=EncodeResponse)
async def text_reverse_endpoint(request: EncodeRequest):
    """Reverse text"""
    result = text_reverse(request.text)
    return EncodeResponse(result=result)

@router.post("/text/sort", response_model=EncodeResponse)
async def text_sort_endpoint(request: EncodeRequest):
    """Sort lines"""
    result = text_sort_lines(request.text)
    return EncodeResponse(result=result)

# Generators
@router.post("/generate/uuid", response_model=EncodeResponse)
async def generate_uuid_endpoint():
    """Generate UUID"""
    result = generate_uuid()
    return EncodeResponse(result=result)

@router.post("/generate/lorem", response_model=EncodeResponse)
async def generate_lorem_endpoint(request: Optional[EncodeRequest] = None):
    """Generate Lorem Ipsum or Random Text"""
    paragraphs = request.paragraphs if request and request.paragraphs else 3
    use_lorem = request.use_lorem if request and request.use_lorem is not None else False
    # Check if characters parameter is provided (for character-based generation)
    characters = None
    if request and hasattr(request, 'indent') and request.indent and request.indent > 0:
        characters = request.indent  # Reusing indent field for characters count
    
    print(f"DEBUG: paragraphs={paragraphs}, use_lorem={use_lorem}, characters={characters}")
    result = generate_lorem_ipsum(paragraphs, use_lorem, characters)
    print(f"DEBUG: result length={len(result)}")
    return EncodeResponse(result=result)
