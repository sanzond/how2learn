#!/usr/bin/env python3
"""
测试音频API接口的脚本
用于验证新的音频访问接口是否正常工作
"""

import requests
import sys

def test_audio_api(test_learning_set_id=1):
    """测试音频API接口"""
    base_url = "http://127.0.0.1:18080"
    
    print("=== 音频API测试 ===")
    print(f"基础URL: {base_url}")
    print(f"测试学习集ID: {test_learning_set_id}")
    print()
    
    # 1. 测试音频访问测试接口
    print("1. 测试音频访问测试接口...")
    test_url = f"{base_url}/api/learning/audio/test/{test_learning_set_id}"
    
    audio_exists = False
    can_generate = False
    
    try:
        response = requests.get(test_url, timeout=10)
        print(f"   请求URL: {test_url}")
        print(f"   响应状态: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   响应内容: {result}")
                
                if result.get('status') == 'success':
                    audio_exists = result.get('has_audio', False)
                    can_generate = result.get('can_generate_audio', False)
                    has_text = result.get('has_text', False)
                    
                    print(f"   学习集名称: {result.get('learning_set_name')}")
                    print(f"   是否有音频: {'✅' if audio_exists else '❌'}")
                    print(f"   是否有文本: {'✅' if has_text else '❌'}")
                    print(f"   可以生成音频: {'✅' if can_generate else '❌'}")
                    
                    if audio_exists:
                        audio_url = result.get('audio_url')
                        file_size = result.get('file_size', 0)
                        print(f"   音频URL: {audio_url}")
                        print(f"   文件大小: {file_size} 字节")
                else:
                    print(f"   ❌ 测试失败: {result.get('message')}")
                    
            except Exception as e:
                print(f"   ❌ JSON解析失败: {e}")
        else:
            print(f"   ❌ 请求失败: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ 网络请求异常: {e}")
    
    print()
    
    # 2. 如果没有音频但可以生成，测试音频生成接口
    if not audio_exists and can_generate:
        print("2. 测试音频生成接口...")
        generate_url = f"{base_url}/api/learning/audio/generate/{test_learning_set_id}"
        
        try:
            print(f"   请求URL: {generate_url}")
            print("   正在生成音频，请等待...")
            
            response = requests.post(generate_url, json={}, timeout=120)  # 增加超时时间
            print(f"   响应状态: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print(f"   响应内容: {result}")
                    
                    if result.get('status') == 'success':
                        print("   ✅ 音频生成成功")
                        print(f"   生成的文件名: {result.get('audio_filename')}")
                        print(f"   文件大小: {result.get('file_size', 0)} 字节")
                        audio_exists = True  # 更新状态
                    else:
                        print(f"   ❌ 音频生成失败: {result.get('message')}")
                        
                except Exception as e:
                    print(f"   ❌ JSON解析失败: {e}")
            else:
                print(f"   ❌ 请求失败: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ 网络请求异常: {e}")
        
        print()
    
    # 3. 测试直接音频文件访问
    if audio_exists:
        print("3. 测试直接音频文件访问...")
        audio_url = f"{base_url}/api/learning/audio/{test_learning_set_id}"
        
        try:
            response = requests.head(audio_url, timeout=10)  # 使用HEAD请求避免下载整个文件
            print(f"   请求URL: {audio_url}")
            print(f"   响应状态: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ 音频文件可直接访问")
                
                # 检查响应头
                content_type = response.headers.get('Content-Type', 'unknown')
                content_length = response.headers.get('Content-Length', 'unknown')
                
                print(f"   Content-Type: {content_type}")
                print(f"   Content-Length: {content_length} bytes")
                
                # 检查CORS头
                cors_origin = response.headers.get('Access-Control-Allow-Origin', 'none')
                print(f"   CORS Origin: {cors_origin}")
                
            else:
                print(f"   ❌ 音频文件访问失败: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ 网络请求异常: {e}")
        
        print()
    else:
        print("2-3. 跳过音频文件访问测试（没有音频文件）")
        print()
    
    # 4. 测试学习数据API（检查音频URL格式）
    print("4. 测试学习数据API...")
    learning_data_url = f"{base_url}/api/learning/data"
    
    try:
        response = requests.get(learning_data_url, timeout=10)
        print(f"   请求URL: {learning_data_url}")
        print(f"   响应状态: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("   ✅ 学习数据获取成功")
                
                # 查找包含音频URL的学习集
                for set_name, set_data in data.items():
                    audio_url = set_data.get('audioUrl')
                    if audio_url:
                        print(f"   学习集 '{set_name}' 音频URL: {audio_url}")
                        
                        # 检查URL格式是否为新的API格式
                        if '/api/learning/audio/' in audio_url:
                            print("   ✅ 使用新的API格式")
                        else:
                            print("   ⚠️  使用旧的URL格式")
                            
            except Exception as e:
                print(f"   ❌ JSON解析失败: {e}")
        else:
            print(f"   ❌ 请求失败: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ 网络请求异常: {e}")
    
    print()
    print("=== 测试完成 ===")
    print()
    print("使用说明：")
    print("1. 确保Odoo服务正在运行 (http://127.0.0.1:18080)")
    print("2. 确保learning_system模块已安装并更新")
    print("3. 确保至少有一个包含音频文件的学习集")
    print("4. 如果测试失败，请检查Odoo日志获取详细错误信息")

if __name__ == "__main__":
    test_learning_set_id = 1
    
    if len(sys.argv) > 1:
        try:
            test_learning_set_id = int(sys.argv[1])
            print(f"使用指定的学习集ID: {test_learning_set_id}")
        except ValueError:
            print("错误：学习集ID必须是数字")
            sys.exit(1)
    
    test_audio_api(test_learning_set_id)