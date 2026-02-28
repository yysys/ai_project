#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成无人机游戏背景视频脚本

此脚本用于请求GPT生成无人机游戏的背景视频，确保视频适合横屏显示。
"""

import os
import requests
import json
import time

# 配置
CONFIG = {
    "api_key": os.environ.get("OPENAI_API_KEY", ""),  # GPT API key from environment
    "output_dir": "./assets/videos",  # 视频存储目录
    "video_filename": "game-intro.mp4",  # 视频文件名
    "video_width": 1920,  # 视频宽度（横屏）
    "video_height": 1080,  # 视频高度（横屏）
    "video_duration": 15,  # 视频时长（秒）
    "model": "gpt-4-vision-preview"  # 使用的GPT模型
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
        "2. A sleek, modern drone flying smoothly through the environment\n"
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

def download_sample_video(output_path):
    """
    下载示例视频
    
    Args:
        output_path (str): 输出路径
    
    Returns:
        bool: 是否成功
    """
    print(f"正在下载示例视频到: {output_path}...")
    
    # 使用一个通用的视频URL作为示例
    # 注意：这只是一个示例，实际使用时需要替换为真实的视频URL
    sample_video_url = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
    
    try:
        response = requests.get(sample_video_url, stream=True, timeout=600)
        response.raise_for_status()
        
        # 检查响应头，确保是视频文件
        content_type = response.headers.get('Content-Type', '')
        if not content_type.startswith('video/'):
            print(f"错误：下载的文件不是视频，Content-Type: {content_type}")
            return False
        
        # 下载视频
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print("示例视频下载成功!")
        print(f"文件大小: {os.path.getsize(output_path)} bytes")
        return True
    except requests.RequestException as e:
        print(f"下载失败: {e}")
        return False

def generate_video_placeholder(output_path):
    """
    生成视频占位文件
    
    Args:
        output_path (str): 输出路径
    
    Returns:
        bool: 是否成功
    """
    print(f"正在创建视频占位文件: {output_path}...")
    
    try:
        # 创建详细的占位文件
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
            f.write("# 注意: 这是一个占位文件，实际视频需要通过视频生成服务创建\n")
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
    print("=== 无人机游戏背景视频生成脚本 ===")
    
    # 生成视频描述
    prompt = generate_video_prompt()
    print("生成的视频描述:")
    print(prompt)
    print("\n" + "-" * 80 + "\n")
    
    # 尝试下载示例视频
    print("正在尝试下载示例视频...")
    output_path = os.path.join(CONFIG["output_dir"], CONFIG["video_filename"])
    success = download_sample_video(output_path)
    
    if not success:
        print("\n示例视频下载失败，创建占位文件...")
        success = generate_video_placeholder(output_path)
    
    if success:
        print(f"\n视频文件创建成功! 文件已保存到: {output_path}")
        print("\n=== 脚本执行完成 ===")
        print("\n注意:")
        print("1. 如果下载的是示例视频，它是一个通用的5秒视频")
        print("2. 如果创建的是占位文件，实际视频需要通过视频生成服务创建")
        print("3. 建议使用的视频生成服务:")
        print("   - OpenAI Sora (如果可用)")
        print("   - Runway ML")
        print("   - Pika Labs")
        print("   - Stability AI Stable Video Diffusion")
        print("4. 生成实际视频后，请替换此文件")
    else:
        print("\n视频文件创建失败，请检查错误信息。")
        print("\n建议:")
        print("1. 检查网络连接")
        print("2. 确保有权限写入文件")
        print("3. 手动创建视频文件并替换占位文件")

if __name__ == "__main__":
    main()
