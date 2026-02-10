import json
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services import storage, user_profile
from .services.claude import stream_response
from .prompts import build_system_prompt


def _get_auth_user(request):
    """Extract and validate auth token from request."""
    token = request.headers.get('X-Auth-Token', '')
    if not token:
        return None
    return storage.get_user_by_token(token)


def _json_body(request):
    """Parse JSON body from request."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return {}


@csrf_exempt
@require_http_methods(['POST'])
def login(request):
    body = _json_body(request)
    email = body.get('email', '').strip().lower()
    if not email:
        return JsonResponse({'error': 'Email is required'}, status=400)

    user = storage.get_user(email)
    if not user:
        user = storage.create_user(email)

    return JsonResponse({
        'email': user['email'],
        'token': user['token'],
    })


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def chats(request):
    user = _get_auth_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    if request.method == 'GET':
        chat_list = storage.list_user_chats(user['email'])
        return JsonResponse({'chats': chat_list})

    # POST — create new chat
    body = _json_body(request)
    message = body.get('message', '').strip()
    if not message:
        return JsonResponse({'error': 'Message is required'}, status=400)

    chat = storage.create_chat(user['email'], message)
    return JsonResponse({'chat': chat}, status=201)


@csrf_exempt
@require_http_methods(['GET'])
def chat_detail(request, chat_id):
    user = _get_auth_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    chat = storage.get_chat(chat_id)
    if not chat:
        return JsonResponse({'error': 'Chat not found'}, status=404)
    if chat['user_email'] != user['email']:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    return JsonResponse({'chat': chat})


@csrf_exempt
@require_http_methods(['POST'])
def chat_send(request, chat_id):
    user = _get_auth_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    chat = storage.get_chat(chat_id)
    if not chat:
        return JsonResponse({'error': 'Chat not found'}, status=404)
    if chat['user_email'] != user['email']:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    body = _json_body(request)
    message = body.get('message', '').strip()
    if not message:
        return JsonResponse({'error': 'Message is required'}, status=400)

    # Save user message
    user_msg = storage.add_message(chat_id, 'user', message)

    # Update user profile interests (still useful for analytics)
    profile = user_profile.update_interests(user['email'], message)

    # Build system prompt (no ad injection — ads are separate cards now)
    system_prompt = build_system_prompt()

    # Get updated chat messages for Claude context
    chat = storage.get_chat(chat_id)
    messages = [
        {'role': m['role'], 'content': m['content']}
        for m in chat['messages']
    ]

    def event_stream():
        full_response = []
        try:
            for chunk in stream_response(messages, system_prompt):
                full_response.append(chunk)
                data = json.dumps({'chunk': chunk})
                yield f'data: {data}\n\n'

            # Save complete assistant response
            complete_text = ''.join(full_response)
            assistant_msg = storage.add_message(chat_id, 'assistant', complete_text)

            done_data = json.dumps({
                'done': True,
                'message_id': assistant_msg.get('id', ''),
            })
            yield f'data: {done_data}\n\n'
        except Exception as e:
            error_data = json.dumps({'error': str(e)})
            yield f'data: {error_data}\n\n'

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream',
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


@csrf_exempt
@require_http_methods(['POST'])
def chat_feedback(request, chat_id):
    user = _get_auth_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    chat = storage.get_chat(chat_id)
    if not chat:
        return JsonResponse({'error': 'Chat not found'}, status=404)
    if chat['user_email'] != user['email']:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    body = _json_body(request)
    message_id = body.get('message_id', '')
    feedback = body.get('feedback', '')  # 'like' or 'dislike'

    if not message_id or feedback not in ('like', 'dislike'):
        return JsonResponse({'error': 'Invalid feedback'}, status=400)

    storage.update_message_feedback(chat_id, message_id, feedback)
    return JsonResponse({'status': 'ok'})
