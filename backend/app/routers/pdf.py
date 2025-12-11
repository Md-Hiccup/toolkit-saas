from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from typing import List
import os
import zipfile
from app.utils.pdf_helpers import (
    merge_pdfs,
    compress_pdf,
    pdf_to_images,
    images_to_pdf,
    extract_text_from_pdf,
    extract_text_with_ocr,
    encrypt_pdf,
    decrypt_pdf,
    remove_pdf_password
)
from app.utils.file_helpers import (
    save_upload_file,
    save_multiple_files,
    cleanup_files,
    generate_unique_filename,
    TEMP_DIR
)

router = APIRouter(prefix="/pdf", tags=["PDF Operations"])

@router.post("/merge")
async def merge_pdf_files(
    files: List[UploadFile] = File(...)
):
    """Merge multiple PDF files into one"""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required")
    
    uploaded_files = []
    try:
        # Save uploaded files
        uploaded_files = await save_multiple_files(files, TEMP_DIR)
        
        # Verify all files are PDFs
        for file_path in uploaded_files:
            if not file_path.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="All files must be PDF format")
        
        # Merge PDFs
        output_filename = generate_unique_filename("merged.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        merge_pdfs(uploaded_files, output_path)
        
        # Cleanup uploaded files
        cleanup_files(uploaded_files)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="merged.pdf",
            background=None
        )
    except Exception as e:
        cleanup_files(uploaded_files)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress")
async def compress_pdf_file(
    file: UploadFile = File(...),
    quality: str = Form("medium")
):
    """Compress a PDF file"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF format")
    
    input_path = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Compress PDF
        output_filename = generate_unique_filename("compressed.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        compress_pdf(input_path, output_path, quality)
        
        # Cleanup input file
        cleanup_files([input_path])
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="compressed.pdf",
            background=None
        )
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pdf-to-image")
async def convert_pdf_to_images(
    file: UploadFile = File(...),
    format: str = Form("PNG")
):
    """Convert PDF to images"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF format")
    
    if format.upper() not in ["PNG", "JPG", "JPEG"]:
        raise HTTPException(status_code=400, detail="Format must be PNG, JPG, or JPEG")
    
    input_path = None
    output_dir = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Convert to images
        output_dir = os.path.join(TEMP_DIR, generate_unique_filename("images"))
        image_paths = pdf_to_images(input_path, output_dir, format.upper())
        
        # Cleanup input file
        cleanup_files([input_path])
        
        if not image_paths:
            raise HTTPException(status_code=500, detail="No images generated")
        
        # Create ZIP file with all images
        zip_filename = generate_unique_filename("images.zip")
        zip_path = os.path.join(TEMP_DIR, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for i, image_path in enumerate(image_paths):
                # Add each image to the zip with a clean name
                arcname = f"page_{i+1}.{format.lower()}"
                zipf.write(image_path, arcname)
        
        # Cleanup image files and directory
        cleanup_files([output_dir])
        
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="images.zip",
            background=None
        )
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        if output_dir:
            cleanup_files([output_dir])
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-to-pdf")
async def convert_images_to_pdf(
    files: List[UploadFile] = File(...),
    quality: str = Form("medium")
):
    """Convert images to PDF with compression"""
    if len(files) < 1:
        raise HTTPException(status_code=400, detail="At least 1 image file is required")
    
    uploaded_files = []
    try:
        # Save uploaded files
        uploaded_files = await save_multiple_files(files, TEMP_DIR)
        
        # Verify all files are images
        valid_extensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
        for file_path in uploaded_files:
            if not any(file_path.lower().endswith(ext) for ext in valid_extensions):
                raise HTTPException(status_code=400, detail="All files must be image format")
        
        # Convert to PDF
        output_filename = generate_unique_filename("converted.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        images_to_pdf(uploaded_files, output_path, quality)
        
        # Cleanup uploaded files
        cleanup_files(uploaded_files)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="converted.pdf",
            background=None
        )
    except Exception as e:
        cleanup_files(uploaded_files)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    use_ocr: bool = Form(False)
):
    """Extract text from PDF or Image"""
    filename_lower = file.filename.lower()
    is_pdf = filename_lower.endswith('.pdf')
    is_image = filename_lower.endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp'))
    
    if not is_pdf and not is_image:
        raise HTTPException(status_code=400, detail="File must be PDF or image format (PNG, JPG, JPEG, TIFF, BMP)")
    
    input_path = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Extract text
        if is_image or use_ocr:
            # For images, always use OCR
            text = extract_text_with_ocr(input_path)
        else:
            # For PDFs without OCR, use standard extraction
            text = extract_text_from_pdf(input_path)
        
        # Cleanup input file
        cleanup_files([input_path])
        
        return {"text": text, "length": len(text)}
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/encrypt")
async def encrypt_pdf_file(
    file: UploadFile = File(...),
    password: str = Form(...),
    owner_password: str = Form(None)
):
    """Encrypt a PDF with password protection"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF format")
    
    if not password or len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    input_path = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Encrypt PDF
        output_filename = generate_unique_filename("encrypted.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        encrypt_pdf(input_path, output_path, password, owner_password)
        
        # Cleanup input file
        cleanup_files([input_path])
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="encrypted.pdf",
            background=None
        )
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decrypt")
async def decrypt_pdf_file(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    """Decrypt a password-protected PDF"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF format")
    
    if not password:
        raise HTTPException(status_code=400, detail="Password is required")
    
    input_path = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Decrypt PDF
        output_filename = generate_unique_filename("decrypted.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        decrypt_pdf(input_path, output_path, password)
        
        # Cleanup input file
        cleanup_files([input_path])
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="decrypted.pdf",
            background=None
        )
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        # Provide more specific error messages
        error_msg = str(e)
        if "not encrypted" in error_msg.lower():
            raise HTTPException(status_code=400, detail="PDF is not password-protected")
        elif "incorrect password" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Incorrect password")
        else:
            raise HTTPException(status_code=500, detail=error_msg)

@router.post("/remove-password")
async def remove_password_from_pdf(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    """Remove password protection from a PDF"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF format")
    
    if not password:
        raise HTTPException(status_code=400, detail="Password is required")
    
    input_path = None
    try:
        # Save uploaded file
        input_path = await save_upload_file(file, TEMP_DIR)
        
        # Remove password
        output_filename = generate_unique_filename("unlocked.pdf")
        output_path = os.path.join(TEMP_DIR, output_filename)
        remove_pdf_password(input_path, output_path, password)
        
        # Cleanup input file
        cleanup_files([input_path])
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="unlocked.pdf",
            background=None
        )
    except Exception as e:
        if input_path:
            cleanup_files([input_path])
        # Provide more specific error messages
        error_msg = str(e)
        if "not encrypted" in error_msg.lower():
            raise HTTPException(status_code=400, detail="PDF is not password-protected")
        elif "incorrect password" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Incorrect password")
        else:
            raise HTTPException(status_code=500, detail=error_msg)
