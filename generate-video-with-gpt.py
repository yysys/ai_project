#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用OpenAI API生成无人机游戏背景视频脚本

此脚本使用OpenAI API生成无人机游戏的背景视频，确保视频适合横屏显示。
"""

import os
import requests
import json
import time

# 配置
CONFIG = {
    "api_key": "YOUR_API_KEY_HERE",  # GPT API key
    "output_dir": "./assets/videos",  # 视频存储目录
    "video_filename": "game-intro.mp4",  # 视频文件名
    "video_width": 1920,  # 视频宽度（横屏）
    "video_height": 1080,  # 视频高度（横屏）
    "video_duration": 15,  # 视频时长（秒）
}

# 确保输出目录存在
os.makedirs(CONFIG["output_dir"], exist_ok=True)

def generate_video_prompt():
    """
    生成详细的视频描述prompt
    
    Returns:
        str: 详细的视频描述
    """
    return (
        "Create a stunning, high-quality animated background video for a drone flight mobile game. "
        "The video should be in landscape orientation (16:9 aspect ratio) and last approximately 15 seconds. "
        "The content should include:\n"
        "\n"
        "1. Aerial view of a scenic landscape with mountains, forests, and lakes\n"
        "2. A sleek, modern drone flying smoothly through environment\n"
        "3. Dynamic camera movements following the drone\n"
        "4. Vibrant colors and realistic lighting effects\n"
        "5. Smooth transitions and fluid animations\n"
        "6. No text or logos on the video\n"
        "7. The video should loop seamlessly\n"
        "\n"
        "Style requirements:\n"
        "- Cinematic and immersive\n"
        "- High resolution and detail\n"
        "- Professional quality suitable for a mobile game\n"
        "- Visually appealing and engaging\n"
        "- Calming yet exciting atmosphere\n"
        "\n"
        "The video will be used as a background for the game's login screen and main menu, "
        "so it should set the mood for an exciting drone flight experience."
    )

def generate_video_with_openai(prompt):
    """
    使用OpenAI API生成视频
    
    Args:
        prompt (str): 视频描述prompt
    
    Returns:
        dict: API响应或错误信息
    """
    print("正在使用OpenAI API生成视频...")
    
    # 尝试使用OpenAI的视频生成API
    # 注意：OpenAI Sora API可能还没有公开，这里使用DALL-E生成图片作为备选
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {CONFIG['api_key']}"
    }
    
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1920x1080",
        "response_format": "url"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        result = response.json()
        
        print("OpenAI API响应:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        return {
            "success": True,
            "data": result
        }
    except requests.RequestException as e:
        print(f"OpenAI API请求失败: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def download_video_from_url(video_url, output_path):
    """
    从URL下载视频
    
    Args:
        video_url (str): 视频URL
        output_path (str): 输出路径
    
    Returns:
        bool: 是否成功
    """
    print(f"正在下载视频到: {output_path}...")
    
    try:
        response = requests.get(video_url, stream=True, timeout=600)
        response.raise_for_status()
        
        # 检查响应头，确保是视频文件
        content_type = response.headers.get('Content-Type', '')
        print(f"Content-Type: {content_type}")
        
        if not content_type.startswith('video/'):
            print(f"警告：下载的文件可能不是视频，Content-Type: {content_type}")
        
        # 下载文件
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        file_size = os.path.getsize(output_path)
        print(f"视频下载成功! 文件大小: {file_size} bytes ({file_size / (1024 * 1024):.2f} MB)")
        return True
    except requests.RequestException as e:
        print(f"下载失败: {e}")
        return False

def create_video_placeholder(output_path, prompt):
    """
    创建视频占位文件
    
    Args:
        output_path (str): 输出路径
        prompt (str): 视频描述
    
    Returns:
        bool: 是否成功
    """
    print(f"正在创建视频占位文件: {output_path}...")
    
    try:
        with open(output_path, 'w') as f:
            f.write(f"# 无人机游戏背景视频\n")
            f.write(f"# 文件名: {CONFIG['video_filename']}\n")
            f.write(f"# 分辨率: {CONFIG['video_width']}x{CONFIG['video_height']} (16:9 横屏)\n")
            f.write(f"# 时长: {CONFIG['video_duration']}秒\n")
            f.write(f"# 格式: MP4\n")
            f.write(f"# 风格: 电影级、沉浸式\n")
            f.write("# 内容:\n")
            f.write("# 1. 山脉、森林、湖泊的风景景观\n")
            f.write("# 2. 现代无人机流畅飞行\n")
            f.write("# 3. 动态相机跟随\n")
            f.write("# 4. 鲜艳的颜色和逼真的光照效果\n")
            f.write("# 5. 流畅的过渡和动画\n")
            f.write("# 6. 无缝循环\n")
            f.write("# 7. 无文字或标志\n")
            f.write(f"# 用途: 游戏登录界面和主菜单背景\n")
            f.write(f"# 生成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("\n")
            f.write("# 视频描述:\n")
            f.write(prompt)
            f.write("\n")
            f.write("# 注意: 这是一个占位文件\n")
            f.write("# OpenAI DALL-E生成的是图片，不是视频\n")
            f.write("# 建议使用以下服务生成实际视频:\n")
            f.write("# 1. OpenAI Sora (如果可用)\n")
            f.write("# 2. Runway ML\n")
            f.write("# 3. Pika Labs\n")
            f.write("# 4. Stability AI Stable Video Diffusion\n")
        
        print("视频占位文件创建成功!")
        return True
    except Exception as e:
        print(f"创建占位文件失败: {e}")
        return False

def main():
    """
    主函数
    """
    print("=== 使用OpenAI API生成无人机游戏背景视频 ===")
    
    # 生成视频描述
    prompt = generate_video_prompt()
    print("生成的视频描述:")
    print(prompt)
    print("\n" + "-" * 80 + "\n")
    
    # 使用OpenAI API生成
    result = generate_video_with_openai(prompt)
    
    output_path = os.path.join(CONFIG["output_dir"], CONFIG["video_filename"])
    
    if result["success"]:
        # 如果API返回了视频URL，下载视频
        if "data" in result["data"] and len(result["data"]["data"]) > 0:
            video_url = result["data"]["data"][0]["url"]
            print(f"\n获取到视频URL: {video_url}")
            success = download_video_from_url(video_url, output_path)
            
            if success:
                print(f"\n视频生成完成! 文件已保存到: {output_path}")
            else:
                print("\n视频下载失败，创建占位文件...")
                create_video_placeholder(output_path, prompt)
        else:
            print("\nAPI未返回视频URL，创建占位文件...")
            create_video_placeholder(output_path, prompt)
    else:
        print(f"\nAPI请求失败: {result['error']}")
        print("\n创建占位文件...")
        create_video_placeholder(output_path, prompt)
    
    print("\n=== 脚本执行完成 ===")
    print("\n说明:")
    print("1. OpenAI DALL-E目前只支持生成图片，不支持视频生成")
    print("2. 脚本尝试使用DALL-E生成图片，但结果可能不是视频")
    print("3. 如果需要真正的视频，建议使用专业的视频生成服务")
    print("4. 占位文件包含了所有必要的配置信息")

if __name__ == "__main__":
    main()
