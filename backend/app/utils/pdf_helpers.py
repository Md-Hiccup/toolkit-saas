import os
import subprocess
from typing import List, Optional
from pypdf import PdfReader, PdfWriter
from PIL import Image
from pdf2image import convert_from_path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
import io

def merge_pdfs(pdf_paths: List[str], output_path: str) -> str:
    """Merge multiple PDF files into one"""
    writer = PdfWriter()
    
    for pdf_path in pdf_paths:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            writer.add_page(page)
    
    with open(output_path, "wb") as output_file:
        writer.write(output_file)
    
    return output_path

def compress_pdf(input_path: str, output_path: str, quality: str = "medium") -> str:
    """Compress PDF by reducing image quality and removing duplicates"""
    
    # Quality settings for Ghostscript
    gs_quality_settings = {
        "low": "/screen",      # 72 dpi
        "medium": "/ebook",    # 150 dpi
        "high": "/printer"     # 300 dpi
    }
    gs_quality = gs_quality_settings.get(quality, "/ebook")
    
    # Try using Ghostscript for better compression
    try:
        result = subprocess.run([
            "gs",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-dPDFSETTINGS={gs_quality}",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            f"-sOutputFile={output_path}",
            input_path
        ], capture_output=True, timeout=30)
        
        if result.returncode == 0 and os.path.exists(output_path):
            return output_path
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        # Ghostscript not available or failed, use pypdf fallback
        pass
    
    # Fallback to pypdf compression
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        writer.add_page(page)
    
    # Compress all pages
    for page in writer.pages:
        page.compress_content_streams()
    
    # Remove duplicate objects and compress
    writer.add_metadata(reader.metadata)
    
    with open(output_path, "wb") as output_file:
        writer.write(output_file)
    
    return output_path

def pdf_to_images(input_path: str, output_dir: str, format: str = "PNG") -> List[str]:
    """Convert PDF pages to images"""
    os.makedirs(output_dir, exist_ok=True)
    
    images = convert_from_path(input_path, dpi=200)
    image_paths = []
    
    # PIL expects "JPEG" not "JPG"
    pil_format = "JPEG" if format.upper() == "JPG" else format.upper()
    
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f"page_{i+1}.{format.lower()}")
        image.save(image_path, pil_format)
        image_paths.append(image_path)
    
    return image_paths

def images_to_pdf(image_paths: List[str], output_path: str, quality: str = "medium") -> str:
    """Convert multiple images to a single PDF with aggressive compression"""
    
    # Quality settings - max dimensions and JPEG quality
    quality_settings = {
        "low": {"max_size": 800, "jpeg_quality": 50},       # Small file size
        "medium": {"max_size": 1200, "jpeg_quality": 65},   # Balanced
        "high": {"max_size": 1600, "jpeg_quality": 80}      # High quality
    }
    settings = quality_settings.get(quality, quality_settings["medium"])
    
    processed_images = []
    
    for image_path in image_paths:
        img = Image.open(image_path)
        
        # Resize image if it's too large
        max_size = settings["max_size"]
        if img.width > max_size or img.height > max_size:
            # Calculate new size maintaining aspect ratio
            ratio = min(max_size / img.width, max_size / img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        processed_images.append(img)
    
    if processed_images:
        # Save directly as PDF with JPEG compression
        # This is much more efficient than ReportLab
        processed_images[0].save(
            output_path,
            "PDF",
            save_all=True,
            append_images=processed_images[1:] if len(processed_images) > 1 else [],
            quality=settings["jpeg_quality"],
            optimize=True,
            resolution=100.0  # DPI for PDF
        )
    
    return output_path

def extract_text_from_pdf(input_path: str) -> str:
    """Extract text from PDF"""
    reader = PdfReader(input_path)
    text = ""
    
    for page in reader.pages:
        text += page.extract_text() + "\n\n"
    
    return text.strip()

def extract_text_with_ocr(input_path: str) -> str:
    """Extract text from PDF or image using OCR (requires tesseract)"""
    try:
        import pytesseract
        
        # Check if input is an image or PDF
        file_ext = input_path.lower()
        if file_ext.endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
            # Direct image OCR
            image = Image.open(input_path)
            text = pytesseract.image_to_string(image)
        else:
            # PDF - convert to images first
            images = convert_from_path(input_path, dpi=300)
            text = ""
            
            for image in images:
                text += pytesseract.image_to_string(image) + "\n\n"
        
        return text.strip()
    except Exception as e:
        # If it's a PDF, fallback to regular text extraction
        if input_path.lower().endswith('.pdf'):
            return extract_text_from_pdf(input_path)
        else:
            raise Exception(f"OCR failed: {str(e)}")

def encrypt_pdf(input_path: str, output_path: str, password: str, owner_password: Optional[str] = None) -> str:
    """
    Encrypt a PDF with a password
    
    Args:
        input_path: Path to input PDF
        output_path: Path to save encrypted PDF
        password: User password (required to open the PDF)
        owner_password: Owner password (optional, for permissions)
    
    Returns:
        Path to encrypted PDF
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    # Copy all pages
    for page in reader.pages:
        writer.add_page(page)
    
    # Encrypt with password
    if owner_password:
        writer.encrypt(user_password=password, owner_password=owner_password)
    else:
        writer.encrypt(user_password=password)
    
    # Write encrypted PDF
    with open(output_path, "wb") as output_file:
        writer.write(output_file)
    
    return output_path

def decrypt_pdf(input_path: str, output_path: str, password: str) -> str:
    """
    Decrypt a password-protected PDF
    
    Args:
        input_path: Path to encrypted PDF
        output_path: Path to save decrypted PDF
        password: Password to decrypt the PDF
    
    Returns:
        Path to decrypted PDF
    
    Raises:
        Exception: If password is incorrect or PDF cannot be decrypted
    """
    reader = PdfReader(input_path)
    
    # Check if PDF is encrypted
    if not reader.is_encrypted:
        raise Exception("PDF is not encrypted")
    
    # Try to decrypt with password
    if not reader.decrypt(password):
        raise Exception("Incorrect password")
    
    writer = PdfWriter()
    
    # Copy all pages
    for page in reader.pages:
        writer.add_page(page)
    
    # Write decrypted PDF (without encryption)
    with open(output_path, "wb") as output_file:
        writer.write(output_file)
    
    return output_path

def remove_pdf_password(input_path: str, output_path: str, password: str) -> str:
    """
    Remove password protection from a PDF
    
    Args:
        input_path: Path to password-protected PDF
        output_path: Path to save unlocked PDF
        password: Current password of the PDF
    
    Returns:
        Path to unlocked PDF
    
    Raises:
        Exception: If password is incorrect or PDF cannot be unlocked
    """
    # This is essentially the same as decrypt_pdf
    return decrypt_pdf(input_path, output_path, password)
