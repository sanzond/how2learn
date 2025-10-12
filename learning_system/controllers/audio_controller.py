from odoo import http
from odoo.http import request
import base64
import mimetypes
import logging

_logger = logging.getLogger(__name__)


class AudioController(http.Controller):
    
    @http.route('/api/learning/audio/<int:learning_set_id>', 
                type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_audio_file(self, learning_set_id, **kwargs):
        """
        公开接口：获取学习集的音频文件
        支持跨域访问，无需认证
        如果音频文件不存在，自动生成音频
        """
        try:
            # 查找学习集记录
            learning_set = request.env['learning.set'].sudo().browse(learning_set_id)
            
            if not learning_set.exists():
                return request.not_found("学习集不存在")
            
            # 如果音频文件不存在，尝试自动生成
            if not learning_set.audio_file:
                _logger.info(f"音频文件不存在，尝试为学习集 {learning_set_id} 自动生成音频")
                
                # 检查是否有完整文本内容
                if not learning_set.full_text:
                    _logger.warning(f"学习集 {learning_set_id} 没有完整文本内容，无法生成音频")
                    return request.not_found("音频文件不存在且无法自动生成：缺少文本内容")
                
                try:
                    # 调用音频生成方法（使用内部方法，不返回UI动作）
                    _logger.info(f"开始为学习集 {learning_set_id} 生成音频...")
                    learning_set.generate_txt2audio()
                    
                    # 重新获取记录以获取生成的音频文件
                    learning_set = request.env['learning.set'].sudo().browse(learning_set_id)
                    
                    if not learning_set.audio_file:
                        _logger.error(f"学习集 {learning_set_id} 音频生成失败")
                        return request.not_found("音频文件生成失败")
                    
                    _logger.info(f"学习集 {learning_set_id} 音频生成成功")
                    
                except Exception as gen_error:
                    _logger.error(f"学习集 {learning_set_id} 音频生成异常: {str(gen_error)}")
                    return request.not_found(f"音频文件自动生成失败: {str(gen_error)}")
            
            # 解码音频文件内容
            audio_content = base64.b64decode(learning_set.audio_file)
            
            # 设置响应头
            filename = learning_set.audio_filename or f"audio_{learning_set_id}.mp3"
            content_type = mimetypes.guess_type(filename)[0] or 'audio/mpeg'
            
            headers = [
                ('Content-Type', content_type),
                ('Content-Length', len(audio_content)),
                ('Content-Disposition', f'inline; filename="{filename}"'),
                ('Cache-Control', 'public, max-age=3600'),  # 缓存1小时
                ('Access-Control-Allow-Origin', '*'),  # 允许跨域
                ('Access-Control-Allow-Methods', 'GET'),
                ('Access-Control-Allow-Headers', 'Content-Type'),
            ]
            
            return request.make_response(audio_content, headers=headers)
            
        except Exception as e:
            _logger.error(f"获取音频文件失败 ID={learning_set_id}: {str(e)}")
            return request.not_found(f"音频文件访问失败: {str(e)}")
    
    @http.route('/api/learning/audio/test/<int:learning_set_id>', 
                type='json', auth='public', methods=['GET'], csrf=False, cors='*')
    def test_audio_access(self, learning_set_id, **kwargs):
        """
        测试接口：检查音频文件是否可访问
        """
        try:
            learning_set = request.env['learning.set'].sudo().browse(learning_set_id)
            
            if not learning_set.exists():
                return {'status': 'error', 'message': '学习集不存在'}
            
            has_audio = bool(learning_set.audio_file)
            has_text = bool(learning_set.full_text)
            
            result = {
                'status': 'success',
                'learning_set_id': learning_set_id,
                'learning_set_name': learning_set.name,
                'has_audio': has_audio,
                'has_text': has_text,
                'can_generate_audio': has_text and not has_audio,
            }
            
            if has_audio:
                result.update({
                    'audio_filename': learning_set.audio_filename,
                    'audio_url': learning_set.audio_url,
                    'file_size': len(base64.b64decode(learning_set.audio_file))
                })
            
            return result
            
        except Exception as e:
            _logger.error(f"测试音频访问失败 ID={learning_set_id}: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    @http.route('/api/learning/audio/generate/<int:learning_set_id>', 
                type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def generate_audio(self, learning_set_id, **kwargs):
        """
        手动触发音频生成接口
        """
        try:
            learning_set = request.env['learning.set'].sudo().browse(learning_set_id)
            
            if not learning_set.exists():
                return {'status': 'error', 'message': '学习集不存在'}
            
            if not learning_set.full_text:
                return {'status': 'error', 'message': '学习集没有完整文本内容，无法生成音频'}
            
            _logger.info(f"手动触发学习集 {learning_set_id} 音频生成")
            
            # 调用音频生成方法
            try:
                learning_set.generate_txt2audio()
                
                return {
                    'status': 'success',
                    'message': '音频生成成功',
                    'learning_set_id': learning_set_id,
                    'audio_filename': learning_set.audio_filename,
                    'audio_url': learning_set.audio_url,
                    'file_size': len(base64.b64decode(learning_set.audio_file)) if learning_set.audio_file else 0
                }
                
            except Exception as gen_error:
                _logger.error(f"学习集 {learning_set_id} 手动音频生成失败: {str(gen_error)}")
                return {'status': 'error', 'message': f'音频生成失败: {str(gen_error)}'}
            
        except Exception as e:
            _logger.error(f"手动音频生成接口异常 ID={learning_set_id}: {str(e)}")
            return {'status': 'error', 'message': str(e)}