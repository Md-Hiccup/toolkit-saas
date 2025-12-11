import base64
import hashlib
import hmac
import jwt
import json
import urllib.parse
import html

# Encoding/Decoding functions
def jwt_encode(text: str, secret: str, algorithm: str = 'HS256') -> str:
    """Encode text as JWT"""
    payload = {'data': text}
    return jwt.encode(payload, secret, algorithm=algorithm)

def jwt_decode(token: str, secret: str, algorithm: str = 'HS256') -> str:
    """Decode JWT token"""
    decoded = jwt.decode(token, secret, algorithms=[algorithm])
    return decoded.get('data', '')

def base32_encode(text: str) -> str:
    """Encode text to Base32"""
    return base64.b32encode(text.encode()).decode()

def base32_decode(text: str) -> str:
    """Decode Base32 text"""
    return base64.b32decode(text.encode()).decode()

def base64_encode(text: str) -> str:
    """Encode text to Base64"""
    return base64.b64encode(text.encode()).decode()

def base64_decode(text: str) -> str:
    """Decode Base64 text"""
    return base64.b64decode(text.encode()).decode()

def url_base64_encode(text: str) -> str:
    """Encode text to URL-safe Base64"""
    return base64.urlsafe_b64encode(text.encode()).decode()

def url_base64_decode(text: str) -> str:
    """Decode URL-safe Base64 text"""
    return base64.urlsafe_b64decode(text.encode()).decode()

def mime_base64_encode(text: str) -> str:
    """Encode text to MIME Base64 (with line breaks)"""
    encoded = base64.b64encode(text.encode()).decode()
    # Add line breaks every 76 characters (MIME standard)
    return '\n'.join([encoded[i:i+76] for i in range(0, len(encoded), 76)])

def mime_base64_decode(text: str) -> str:
    """Decode MIME Base64 text"""
    # Remove line breaks
    clean_text = text.replace('\n', '').replace('\r', '')
    return base64.b64decode(clean_text.encode()).decode()

def url_encode(text: str) -> str:
    """URL encode text"""
    return urllib.parse.quote(text)

def url_decode(text: str) -> str:
    """Decode URL-encoded text"""
    return urllib.parse.unquote(text)

def html_encode(text: str) -> str:
    """Encode HTML entities"""
    return html.escape(text)

def html_decode(text: str) -> str:
    """Decode HTML entities"""
    return html.unescape(text)

def unicode_escape(text: str) -> str:
    """Escape Unicode characters"""
    return text.encode('unicode-escape').decode('ascii')

def unicode_unescape(text: str) -> str:
    """Unescape Unicode characters"""
    return text.encode('ascii').decode('unicode-escape')

# JSON Formatting functions
def format_json(text: str, indent: int = 2) -> str:
    """Format JSON with indentation"""
    data = json.loads(text)
    return json.dumps(data, indent=indent, ensure_ascii=False)

def minify_json(text: str) -> str:
    """Minify JSON by removing whitespace"""
    data = json.loads(text)
    return json.dumps(data, separators=(',', ':'), ensure_ascii=False)

# Aliases for backward compatibility
encode_jwt = jwt_encode
decode_jwt = jwt_decode
encode_base32 = base32_encode
decode_base32 = base32_decode
encode_base64 = base64_encode
decode_base64 = base64_decode
encode_url_base64 = url_base64_encode
decode_url_base64 = url_base64_decode
encode_mime_base64 = mime_base64_encode
decode_mime_base64 = mime_base64_decode

# Hashing functions
def hash_md5(text: str) -> str:
    """Generate MD5 hash"""
    return hashlib.md5(text.encode()).hexdigest()

def hash_sha1(text: str) -> str:
    """Generate SHA1 hash"""
    return hashlib.sha1(text.encode()).hexdigest()

def hash_sha256(text: str) -> str:
    """Generate SHA256 hash"""
    return hashlib.sha256(text.encode()).hexdigest()

def hash_sha512(text: str) -> str:
    """Generate SHA512 hash"""
    return hashlib.sha512(text.encode()).hexdigest()

# HMAC functions
def hmac_md5(text: str, secret: str) -> str:
    """Generate HMAC-MD5"""
    return hmac.new(secret.encode(), text.encode(), hashlib.md5).hexdigest()

def hmac_sha1(text: str, secret: str) -> str:
    """Generate HMAC-SHA1"""
    return hmac.new(secret.encode(), text.encode(), hashlib.sha1).hexdigest()

def hmac_sha256(text: str, secret: str) -> str:
    """Generate HMAC-SHA256"""
    return hmac.new(secret.encode(), text.encode(), hashlib.sha256).hexdigest()

def hmac_sha512(text: str, secret: str) -> str:
    """Generate HMAC-SHA512"""
    return hmac.new(secret.encode(), text.encode(), hashlib.sha512).hexdigest()

# JSON functions
def json_format(text: str, indent: int = 2) -> str:
    """Format JSON with indentation"""
    data = json.loads(text)
    return json.dumps(data, indent=indent, ensure_ascii=False)

def json_minify(text: str) -> str:
    """Minify JSON"""
    data = json.loads(text)
    return json.dumps(data, separators=(',', ':'), ensure_ascii=False)

# Text manipulation functions
def text_upper(text: str) -> str:
    """Convert text to uppercase"""
    return text.upper()

def text_lower(text: str) -> str:
    """Convert text to lowercase"""
    return text.lower()

def text_title(text: str) -> str:
    """Convert text to title case"""
    return text.title()

def text_reverse(text: str) -> str:
    """Reverse text"""
    return text[::-1]

def text_sort_lines(text: str, reverse: bool = False) -> str:
    """Sort lines alphabetically"""
    lines = text.split('\n')
    lines.sort(reverse=reverse)
    return '\n'.join(lines)

def generate_uuid() -> str:
    """Generate UUID v4"""
    import uuid
    return str(uuid.uuid4())

def generate_lorem_ipsum(paragraphs: int = 3, use_lorem: bool = False, characters: int = None) -> str:
    """Generate varied placeholder text or traditional Lorem Ipsum
    
    Args:
        paragraphs: Number of paragraphs to generate (if characters is None)
        use_lorem: Use traditional Lorem Ipsum text
        characters: If specified, generate text with approximately this many characters
    """
    import random
    
    # Traditional Lorem Ipsum text
    if use_lorem:
        lorem_paragraphs = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
            "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
            "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        ]
        result = []
        for i in range(paragraphs):
            result.append(lorem_paragraphs[i % len(lorem_paragraphs)])
        return '\n\n'.join(result)
    
    # Random text generator
    words = [
        "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "runs", "through",
        "forest", "mountain", "river", "valley", "ocean", "desert", "city", "village", "town",
        "beautiful", "amazing", "wonderful", "fantastic", "incredible", "stunning", "gorgeous", "lovely",
        "large", "small", "tiny", "huge", "massive", "gigantic", "little", "big", "great",
        "happy", "sad", "excited", "calm", "peaceful", "joyful", "content", "pleased", "delighted",
        "red", "blue", "green", "yellow", "purple", "orange", "pink", "black", "white", "gray",
        "cat", "dog", "bird", "fish", "horse", "elephant", "lion", "tiger", "bear", "wolf",
        "tree", "flower", "grass", "plant", "bush", "leaf", "branch", "root", "seed", "fruit",
        "sun", "moon", "star", "cloud", "rain", "snow", "wind", "storm", "thunder", "lightning",
        "book", "pen", "paper", "desk", "chair", "table", "door", "window", "wall", "floor",
        "music", "song", "dance", "art", "paint", "draw", "write", "read", "sing", "play",
        "walk", "run", "jump", "swim", "fly", "climb", "crawl", "slide", "roll", "spin",
        "eat", "drink", "sleep", "wake", "rest", "work", "study", "learn", "teach", "help",
        "love", "like", "enjoy", "prefer", "want", "need", "have", "get", "give", "take",
        "see", "look", "watch", "hear", "listen", "feel", "touch", "smell", "taste", "sense",
        "think", "know", "believe", "understand", "remember", "forget", "learn", "discover", "find", "search"
    ]
    
    def generate_sentence():
        """Generate a random sentence"""
        length = random.randint(8, 20)
        sentence_words = [random.choice(words) for _ in range(length)]
        sentence_words[0] = sentence_words[0].capitalize()
        return ' '.join(sentence_words) + '.'
    
    def generate_paragraph():
        """Generate a random paragraph"""
        num_sentences = random.randint(4, 8)
        sentences = [generate_sentence() for _ in range(num_sentences)]
        return ' '.join(sentences)
    
    # Character-based generation
    if characters is not None and characters > 0:
        result_text = ""
        while len(result_text) < characters:
            result_text += generate_sentence() + " "
        # Trim to requested length but don't cut mid-word
        if len(result_text) > characters:
            result_text = result_text[:characters].rstrip()
        return result_text
    
    # Paragraph-based generation
    result = []
    for _ in range(paragraphs):
        result.append(generate_paragraph())
    
    return '\n\n'.join(result)
