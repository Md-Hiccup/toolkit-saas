from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
import json
import re

router = APIRouter(prefix="/json-editor", tags=["JSON Editor"])

class JSONTransformRequest(BaseModel):
    input_json: str
    expression: Optional[str] = None
    operation: Optional[str] = "format"  # format, query, transform

class JSONTransformResponse(BaseModel):
    result: str
    success: bool
    error: Optional[str] = None

@router.post("/transform", response_model=JSONTransformResponse)
async def transform_json(request: JSONTransformRequest):
    """Transform JSON with various operations"""
    try:
        # Parse input JSON
        data = json.loads(request.input_json)
        
        if request.operation == "format":
            # Format JSON with indentation
            result = json.dumps(data, indent=2, ensure_ascii=False)
            return JSONTransformResponse(result=result, success=True)
        
        elif request.operation == "minify":
            # Minify JSON
            result = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
            return JSONTransformResponse(result=result, success=True)
        
        elif request.operation == "query":
            # Simple JSONPath-like queries
            if not request.expression:
                return JSONTransformResponse(result=json.dumps(data, indent=2), success=True)
            
            result = query_json(data, request.expression)
            return JSONTransformResponse(result=json.dumps(result, indent=2, ensure_ascii=False), success=True)
        
        elif request.operation == "transform":
            # Apply transformations
            if not request.expression:
                return JSONTransformResponse(result=json.dumps(data, indent=2), success=True)
            
            result = transform_json_data(data, request.expression)
            return JSONTransformResponse(result=json.dumps(result, indent=2, ensure_ascii=False), success=True)
        
        else:
            return JSONTransformResponse(
                result="",
                success=False,
                error=f"Unknown operation: {request.operation}"
            )
            
    except json.JSONDecodeError as e:
        return JSONTransformResponse(
            result="",
            success=False,
            error=f"Invalid JSON: {str(e)}"
        )
    except Exception as e:
        return JSONTransformResponse(
            result="",
            success=False,
            error=f"Error: {str(e)}"
        )

def query_json(data: Any, expression: str) -> Any:
    """Enhanced JSON query with calculations and aggregations"""
    expression = expression.strip()
    
    # Support both sum() and $sum() syntax
    func_name = None
    inner_expr = None
    
    # Check for $ prefix functions
    if expression.startswith('$sum(') and expression.endswith(')'):
        func_name = 'sum'
        inner_expr = expression[5:-1].strip()
    elif expression.startswith('$avg(') and expression.endswith(')'):
        func_name = 'avg'
        inner_expr = expression[5:-1].strip()
    elif expression.startswith('$min(') and expression.endswith(')'):
        func_name = 'min'
        inner_expr = expression[5:-1].strip()
    elif expression.startswith('$max(') and expression.endswith(')'):
        func_name = 'max'
        inner_expr = expression[5:-1].strip()
    elif expression.startswith('$count(') and expression.endswith(')'):
        func_name = 'count'
        inner_expr = expression[7:-1].strip()
    # Check for regular functions
    elif expression.startswith('sum(') and expression.endswith(')'):
        func_name = 'sum'
        inner_expr = expression[4:-1].strip()
    elif expression.startswith('avg(') and expression.endswith(')'):
        func_name = 'avg'
        inner_expr = expression[4:-1].strip()
    elif expression.startswith('min(') and expression.endswith(')'):
        func_name = 'min'
        inner_expr = expression[4:-1].strip()
    elif expression.startswith('max(') and expression.endswith(')'):
        func_name = 'max'
        inner_expr = expression[4:-1].strip()
    elif expression.startswith('count(') and expression.endswith(')'):
        func_name = 'count'
        inner_expr = expression[6:-1].strip()
    
    # Process aggregation functions
    if func_name and inner_expr:
        # Check if it contains mathematical operations
        if any(op in inner_expr for op in ['*', '/', '+', '-', '(', ')']):
            values = evaluate_complex_expression(data, inner_expr)
        else:
            values = extract_array_values(data, inner_expr)
        
        if func_name == 'sum':
            return sum(values) if values else 0
        elif func_name == 'avg':
            return sum(values) / len(values) if values else 0
        elif func_name == 'min':
            return min(values) if values else None
        elif func_name == 'max':
            return max(values) if values else None
        elif func_name == 'count':
            return len(values)
    
    # Support basic dot notation queries like "user.name" or "items[0].title"
    parts = re.split(r'\.|\[|\]', expression)
    parts = [p for p in parts if p]  # Remove empty strings
    
    result = data
    for part in parts:
        if isinstance(result, dict):
            result = result.get(part, None)
        elif isinstance(result, list):
            try:
                index = int(part)
                result = result[index] if 0 <= index < len(result) else None
            except (ValueError, IndexError):
                result = None
        else:
            result = None
        
        if result is None:
            break
    
    return result

def evaluate_complex_expression(data: Any, expression: str) -> list:
    """Evaluate complex expressions like Account.Order.Product.(Price*Quantity)"""
    # Find the mathematical expression in the last set of parentheses
    # Use a more robust pattern that handles nested parentheses
    # Find the last opening parenthesis and match to the end
    last_paren = expression.rfind('.(')
    if last_paren == -1:
        return extract_array_values(data, expression)
    
    # Extract everything after '.(' and remove the trailing ')'
    math_expr = expression[last_paren + 2:]
    if math_expr.endswith(')'):
        math_expr = math_expr[:-1]
    
    path_before = expression[:last_paren]  # e.g., "Store.Sales"
    
    print(f"DEBUG: Expression: {expression}")
    print(f"DEBUG: Math expr: {math_expr}")
    print(f"DEBUG: Path before: {path_before}")
    
    # Navigate through the nested structure
    current = data
    if path_before:
        parts = path_before.split('.')
        print(f"DEBUG: Parts to navigate: {parts}")
        
        for i, part in enumerate(parts):
            print(f"DEBUG: Navigating to '{part}', current type: {type(current)}")
            
            if isinstance(current, dict):
                current = current.get(part)
                print(f"DEBUG: After getting '{part}', current type: {type(current)}, value: {current if not isinstance(current, list) else f'list with {len(current)} items'}")
                if current is None:
                    print(f"DEBUG: '{part}' not found in dict")
                    return []
            elif isinstance(current, list):
                # If we hit an array before reaching the end, we need to recurse
                print(f"DEBUG: Hit array at '{part}', recursing...")
                remaining_parts = parts[i:]
                remaining_path = '.'.join(remaining_parts) + '.(' + math_expr + ')'
                
                all_results = []
                for item in current:
                    sub_results = evaluate_complex_expression(item, remaining_path)
                    all_results.extend(sub_results)
                return all_results
            else:
                print(f"DEBUG: Unexpected type at '{part}': {type(current)}")
                return []
    
    print(f"DEBUG: Final current type: {type(current)}, is list: {isinstance(current, list)}")
    
    # Process array items or nested arrays
    results = []
    
    def process_items(items):
        """Recursively process items, handling nested arrays"""
        local_results = []
        print(f"DEBUG: process_items called with {len(items) if isinstance(items, list) else 'non-list'} items")
        
        if isinstance(items, list):
            for idx, item in enumerate(items):
                print(f"DEBUG: Processing item {idx}: {type(item)}")
                
                if isinstance(item, dict):
                    print(f"DEBUG: Item keys: {list(item.keys())}")
                    
                    # Try to evaluate the expression with this item's values
                    eval_expr = math_expr
                    
                    # Get all field names from the expression (words that start with uppercase or lowercase letter)
                    field_names = re.findall(r'\b[A-Za-z]\w*\b', math_expr)
                    field_names = list(set(field_names))  # Remove duplicates
                    print(f"DEBUG: Required field names: {field_names}")
                    
                    # Check if all required fields exist in this item
                    has_all_fields = all(field in item for field in field_names)
                    print(f"DEBUG: Has all fields: {has_all_fields}")
                    
                    if has_all_fields:
                        # Sort keys by length (longest first) to avoid partial replacements
                        sorted_keys = sorted(item.keys(), key=len, reverse=True)
                        
                        for key in sorted_keys:
                            val = item[key]
                            if isinstance(val, (int, float)):
                                # Replace field name with its value
                                # Use word boundaries to avoid partial matches
                                pattern = r'\b' + re.escape(key) + r'\b'
                                eval_expr = re.sub(pattern, str(val), eval_expr)
                        
                        # Evaluate the expression
                        try:
                            result = safe_eval(eval_expr)
                            if result is not None:
                                local_results.append(result)
                        except Exception as e:
                            # Skip this item if evaluation fails
                            import traceback
                            print(f"Error evaluating {eval_expr}: {e}")
                            traceback.print_exc()
                            pass
                    else:
                        # Some fields not found, check nested arrays
                        for value in item.values():
                            if isinstance(value, list):
                                local_results.extend(process_items(value))
                elif isinstance(item, list):
                    local_results.extend(process_items(item))
        return local_results
    
    results = process_items(current)
    return results

def safe_eval(expr: str) -> float:
    """Safely evaluate mathematical expressions"""
    # Clean up the expression
    expr = expr.strip()
    
    # Only allow numbers, operators, parentheses, and spaces
    allowed_chars = set('0123456789+-*/(). ')
    if not all(c in allowed_chars for c in expr):
        raise ValueError(f"Invalid characters in expression: {expr}")
    
    try:
        # Use eval with restricted globals/locals for safety
        result = eval(expr, {"__builtins__": {}}, {})
        return float(result)
    except Exception as e:
        return None

def extract_array_values(data: Any, path: str) -> list:
    """Extract numeric values from nested arrays using path like 'School.Classes.Students.Score'"""
    parts = path.split('.')
    
    def extract_recursive(current: Any, remaining_parts: list) -> list:
        """Recursively extract values from nested structures"""
        if not remaining_parts:
            return []
        
        if len(remaining_parts) == 1:
            # Last part - extract the field value
            field = remaining_parts[0]
            if isinstance(current, dict) and field in current:
                val = current[field]
                if isinstance(val, (int, float)):
                    return [val]
            elif isinstance(current, list):
                values = []
                for item in current:
                    if isinstance(item, dict) and field in item:
                        val = item[field]
                        if isinstance(val, (int, float)):
                            values.append(val)
                return values
            return []
        
        # More parts to navigate
        part = remaining_parts[0]
        rest = remaining_parts[1:]
        
        if isinstance(current, dict):
            next_val = current.get(part)
            if next_val is not None:
                return extract_recursive(next_val, rest)
        elif isinstance(current, list):
            # Current is an array, recurse into each item
            all_values = []
            for item in current:
                if isinstance(item, dict) and part in item:
                    all_values.extend(extract_recursive(item[part], rest))
                else:
                    # Try to continue with the same path on the item
                    all_values.extend(extract_recursive(item, remaining_parts))
            return all_values
        
        return []
    
    return extract_recursive(data, parts)

def transform_json_data(data: Any, expression: str) -> Any:
    """Apply simple transformations to JSON data"""
    # Support basic transformations
    if expression.startswith("keys"):
        if isinstance(data, dict):
            return list(data.keys())
    elif expression.startswith("values"):
        if isinstance(data, dict):
            return list(data.values())
    elif expression.startswith("length") or expression.startswith("count"):
        if isinstance(data, (list, dict, str)):
            return len(data)
    elif expression.startswith("sort"):
        if isinstance(data, list):
            return sorted(data)
    elif expression.startswith("reverse"):
        if isinstance(data, list):
            return list(reversed(data))
    elif expression.startswith("unique"):
        if isinstance(data, list):
            return list(set(data))
    
    return data

@router.post("/validate", response_model=JSONTransformResponse)
async def validate_json(request: JSONTransformRequest):
    """Validate JSON syntax"""
    try:
        data = json.loads(request.input_json)
        return JSONTransformResponse(
            result="Valid JSON",
            success=True
        )
    except json.JSONDecodeError as e:
        return JSONTransformResponse(
            result="",
            success=False,
            error=f"Invalid JSON at line {e.lineno}, column {e.colno}: {e.msg}"
        )
