#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

import openai
from openai import AsyncOpenAI

async def test_openai_keys():
    """Test both OpenAI API keys to see which one works"""
    print("🤖 TESTING OPENAI API KEYS")
    print("=" * 50)
    
    keys = [
        "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",
        "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"
    ]
    
    working_key = None
    
    for i, key in enumerate(keys, 1):
        print(f"\n🔑 Testing API Key #{i}: {key[:25]}...")
        
        try:
            client = AsyncOpenAI(api_key=key)
            
            # Test with a simple chat completion
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are Mr. Happy, a friendly cricket betting assistant."},
                    {"role": "user", "content": "Hello! Tell me about cricket in one sentence."}
                ],
                max_tokens=50,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content
            print(f"✅ API Key #{i} WORKS!")
            print(f"🎯 Response: {reply}")
            working_key = key
            break
            
        except Exception as e:
            print(f"❌ API Key #{i} failed: {str(e)}")
            continue
    
    if working_key:
        print(f"\n🎉 SUCCESS! Using API Key: {working_key[:25]}...")
        
        # Update .env file with working key
        with open('/app/backend/.env', 'r') as f:
            content = f.read()
        
        # Replace the OpenAI key line
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('OPENAI_API_KEY='):
                lines[i] = f'OPENAI_API_KEY={working_key}'
                break
        
        with open('/app/backend/.env', 'w') as f:
            f.write('\n'.join(lines))
        
        print("✅ Updated .env file with working API key")
        return working_key
    else:
        print("\n❌ Neither API key worked. Will use mock responses.")
        return None

if __name__ == "__main__":
    asyncio.run(test_openai_keys())