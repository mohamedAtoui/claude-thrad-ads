from openai import OpenAI
from django.conf import settings


def stream_response(messages: list, system_prompt: str):
    """
    Generator that yields text chunks from OpenAI API streaming response.
    messages: list of {"role": "user"|"assistant", "content": "..."}
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    api_messages = [{'role': 'system', 'content': system_prompt}]
    for msg in messages:
        api_messages.append({'role': msg['role'], 'content': msg['content']})

    stream = client.chat.completions.create(
        model='gpt-4.1-nano',
        max_tokens=1024,
        messages=api_messages,
        stream=True,
    )

    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
