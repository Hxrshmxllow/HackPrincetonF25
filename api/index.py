import sys
import os
import json
from io import BytesIO
from urllib.parse import urlparse, parse_qs, quote

# Add the server directory to the path
server_path = os.path.join(os.path.dirname(__file__), '..', 'server')
sys.path.insert(0, os.path.abspath(server_path))

try:
    from app import create_app
    # Create Flask app instance
    app = create_app()
except Exception as e:
    # If app creation fails, we'll handle it in the handler
    app = None
    app_error = str(e)

def handler(request):
    """
    Vercel serverless function handler for Flask app
    """
    try:
        # Handle app initialization error
        if app is None:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Failed to initialize Flask app: {app_error}'})
            }
        
        # Vercel Python runtime passes request as a dict
        # Convert to dict if it's an object
        if not isinstance(request, dict):
            # Try to convert request object to dict
            req_dict = {}
            if hasattr(request, '__dict__'):
                req_dict = request.__dict__
            else:
                # Try common attributes
                for attr in ['path', 'method', 'headers', 'body', 'query', 'url']:
                    if hasattr(request, attr):
                        req_dict[attr] = getattr(request, attr)
            request = req_dict
        
        # Extract path from request
        path = request.get('path', '/')
        
        # If path is not in request, try to get from URL
        if path == '/' and 'url' in request:
            parsed_url = urlparse(request['url'])
            path = parsed_url.path
        
        # Vercel rewrites send the full path (e.g., /listings/?query=...)
        # We need to extract just the path part, not the query
        if '?' in path:
            path = path.split('?')[0]
        
        # Remove /api prefix if present (Vercel rewrites might add this)
        if path.startswith('/api'):
            path = path[4:] or '/'
        
        # Ensure path starts with /
        if not path.startswith('/'):
            path = '/' + path
        
        # Get headers - make case-insensitive (do this early for OPTIONS handling)
        headers_dict_raw = request.get('headers', {})
        if not isinstance(headers_dict_raw, dict):
            # Try to convert to dict
            if hasattr(headers_dict_raw, '__dict__'):
                headers_dict_raw = headers_dict_raw.__dict__
            else:
                headers_dict_raw = {}
        
        # Normalize headers to lowercase keys for easier access
        headers_dict = {}
        for k, v in headers_dict_raw.items():
            headers_dict[k.lower()] = v
        
        # Get HTTP method
        method = request.get('method', 'GET').upper()
        
        # Handle OPTIONS preflight requests
        if method == 'OPTIONS':
            origin = headers_dict.get('origin', '*')
            # In Vercel, always allow the origin if it's a vercel.app domain, otherwise allow all
            if origin and origin != '*' and (origin.endswith('.vercel.app') or origin.endswith('vercel.app')):
                cors_origin = origin
                cors_credentials = 'true'
            else:
                # Allow all origins in Vercel environment
                cors_origin = origin if origin != '*' else '*'
                cors_credentials = 'true' if origin and origin != '*' else 'false'
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': cors_origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': cors_credentials,
                    'Access-Control-Max-Age': '3600'
                },
                'body': ''
            }
        
        # Get request body
        body = b''
        body_data = request.get('body', '')
        if body_data:
            if isinstance(body_data, str):
                body = body_data.encode('utf-8')
            elif isinstance(body_data, bytes):
                body = body_data
            else:
                body = json.dumps(body_data).encode('utf-8')
        
        # Get query string from request
        query_string = ''
        if 'query' in request:
            query = request['query']
            if isinstance(query, dict):
                # Convert dict to query string
                query_parts = []
                for k, v in query.items():
                    if isinstance(v, list):
                        for item in v:
                            query_parts.append(f'{quote(str(k))}={quote(str(item))}')
                    else:
                        query_parts.append(f'{quote(str(k))}={quote(str(v))}')
                query_string = '&'.join(query_parts)
            elif isinstance(query, str):
                query_string = query
        elif 'url' in request:
            # Extract query from URL
            parsed_url = urlparse(request['url'])
            query_string = parsed_url.query
        
        # Build WSGI environ
        environ = {
            'REQUEST_METHOD': method,
            'PATH_INFO': path,
            'QUERY_STRING': query_string,
            'CONTENT_TYPE': headers_dict.get('content-type', ''),
            'CONTENT_LENGTH': str(len(body)),
            'SERVER_NAME': 'localhost',
            'SERVER_PORT': '443',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': BytesIO(body),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': False,
            'wsgi.multiprocess': True,
            'wsgi.run_once': False,
        }
        
        # Add HTTP headers to environ
        for key, value in headers_dict.items():
            if value is not None:
                key_upper = key.upper().replace('-', '_')
                if key_upper not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                    environ[f'HTTP_{key_upper}'] = str(value)
        
        # Response data
        response_data = []
        status_code = [200]
        response_headers = []
        
        def start_response(status, response_headers_list):
            status_code[0] = int(status.split()[0])
            response_headers.extend(response_headers_list)
        
        # Call Flask app
        app_iter = app(environ, start_response)
        
        try:
            for data in app_iter:
                response_data.append(data)
        finally:
            if hasattr(app_iter, 'close'):
                app_iter.close()
        
        # Build response
        response_body = b''.join(response_data)
        if isinstance(response_body, bytes):
            try:
                response_body = response_body.decode('utf-8')
            except:
                response_body = str(response_body)
        
        # Convert headers to dict
        final_headers = {name: value for name, value in response_headers}
        
        # Always add CORS headers to ensure they're present
        # Get origin from headers (case-insensitive now)
        origin = headers_dict.get('origin', '*')
        
        # Debug logging (will appear in Vercel logs)
        print(f"Request origin: {origin}")
        print(f"All headers: {headers_dict}")
        
        # ALWAYS set CORS headers - override any Flask headers
        # In Vercel, allow the specific origin if it's a vercel.app domain, otherwise allow all
        if origin and origin != '*' and (origin.endswith('.vercel.app') or origin.endswith('vercel.app')):
            final_headers['Access-Control-Allow-Origin'] = origin
            final_headers['Access-Control-Allow-Credentials'] = 'true'
            print(f"Setting CORS origin to: {origin}")
        else:
            # Allow all origins (or the specific origin if provided)
            cors_origin = origin if origin != '*' else '*'
            final_headers['Access-Control-Allow-Origin'] = cors_origin
            if origin and origin != '*':
                final_headers['Access-Control-Allow-Credentials'] = 'true'
            print(f"Setting CORS origin to: {cors_origin}")
        
        # ALWAYS set these CORS headers (override any existing ones)
        final_headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        final_headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        final_headers['Access-Control-Expose-Headers'] = 'Authorization'
        
        print(f"Final response headers: {final_headers}")
        
        return {
            'statusCode': status_code[0],
            'headers': final_headers,
            'body': response_body
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        # Log error (will appear in Vercel logs)
        print(f"Error in handler: {str(e)}")
        print(error_trace)
        
        # Get origin for CORS even in error case
        try:
            headers_dict_raw = request.get('headers', {}) if isinstance(request, dict) else {}
            if not isinstance(headers_dict_raw, dict):
                headers_dict_raw = {}
            headers_dict = {k.lower(): v for k, v in headers_dict_raw.items()}
            origin = headers_dict.get('origin', '*')
            cors_origin = origin if origin != '*' and origin.endswith('.vercel.app') else '*'
        except:
            cors_origin = '*'
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': cors_origin,
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Expose-Headers': 'Authorization'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'traceback': error_trace
            })
        }
