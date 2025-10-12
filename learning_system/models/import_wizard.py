from odoo import models, fields, api
from odoo.exceptions import UserError
import json
import base64


class LearnimportWizard(models.TransientModel):
    _name = 'learning.import.wizard'
    _description = 'Learning Data Import Wizard'

    name = fields.Char('向导名称', default='JSON 数据导入', readonly=True)
    json_file = fields.Binary('JSON 文件', required=True, help="选择要导入的 JSON 文件")
    json_filename = fields.Char('文件名')
    json_text = fields.Text('JSON 文本', help="或者直接粘贴 JSON 内容")
    import_mode = fields.Selection([
        ('file', '从文件导入'),
        ('text', '从文本导入')
    ], string='导入模式', default='file', required=True)
    
    # Preview fields
    preview_data = fields.Text('数据预览', readonly=True)
    show_preview = fields.Boolean('显示预览', default=False)
    
    # Import options
    overwrite_existing = fields.Boolean('覆盖已存在的学习集', default=False, 
                                       help="如果启用，将删除同名的现有学习集并重新创建")
    
    def action_preview_data(self):
        """Preview the JSON data before import"""
        try:
            json_data = self._get_json_data()
            
            # Parse and validate JSON
            if isinstance(json_data, str):
                data = json.loads(json_data)
            else:
                data = json_data
            
            # Create preview summary
            preview_lines = []
            preview_lines.append("=== 数据预览 ===\n")
            
            for set_name, set_data in data.items():
                preview_lines.append(f"学习集: {set_name}")
                preview_lines.append(f"  描述: {set_data.get('description', '无')}")
                preview_lines.append(f"  用户: {set_data.get('user', 'public')}")
                
                vocab_count = len(set_data.get('vocabulary', []))
                sentence_count = len(set_data.get('sentences', []))
                preview_lines.append(f"  词汇数量: {vocab_count}")
                preview_lines.append(f"  句子数量: {sentence_count}")
                
                # Show first few vocabulary items
                vocabulary = set_data.get('vocabulary', [])[:3]
                if vocabulary:
                    preview_lines.append("  词汇示例:")
                    for vocab in vocabulary:
                        word = vocab.get('word', '未知')
                        translation = vocab.get('translation', '无翻译')
                        preview_lines.append(f"    - {word}: {translation}")
                
                # Show first few sentences
                sentences = set_data.get('sentences', [])[:2]
                if sentences:
                    preview_lines.append("  句子示例:")
                    for sentence in sentences:
                        title = sentence.get('title', '未知')
                        text = sentence.get('sentence', '无内容')[:50] + "..." if len(sentence.get('sentence', '')) > 50 else sentence.get('sentence', '无内容')
                        preview_lines.append(f"    - {title}: {text}")
                
                preview_lines.append("")
            
            self.preview_data = '\n'.join(preview_lines)
            self.show_preview = True
            
            return {
                'type': 'ir.actions.act_window',
                'res_model': 'learning.import.wizard',
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'new',
                'context': self.env.context,
            }
            
        except json.JSONDecodeError as e:
            raise UserError(f"JSON 格式错误: {str(e)}")
        except Exception as e:
            raise UserError(f"预览失败: {str(e)}")

    def action_import_data(self):
        """Import the JSON data"""
        try:
            json_data = self._get_json_data()
            
            # Parse JSON
            if isinstance(json_data, str):
                data = json.loads(json_data)
            else:
                data = json_data
            
            # Check for existing learning sets if overwrite is disabled
            if not self.overwrite_existing:
                existing_sets = []
                for set_name in data.keys():
                    existing = self.env['learning.set'].search([('name', '=', set_name)], limit=1)
                    if existing:
                        existing_sets.append(set_name)
                
                if existing_sets:
                    raise UserError(f"以下学习集已存在: {', '.join(existing_sets)}。请启用'覆盖已存在的学习集'选项或手动删除现有数据。")
            
            # Delete existing sets if overwrite is enabled
            if self.overwrite_existing:
                for set_name in data.keys():
                    existing = self.env['learning.set'].search([('name', '=', set_name)])
                    if existing:
                        existing.unlink()
            
            # Import data using the learning.set model method
            result = self.env['learning.set'].import_from_json_data(data)
            
            # Show success message
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '导入成功',
                    'message': result['message'],
                    'type': 'success',
                    'sticky': False,
                }
            }
            
        except Exception as e:
            raise UserError(f"导入失败: {str(e)}")

    def _get_json_data(self):
        """Get JSON data from file or text input"""
        if self.import_mode == 'file':
            if not self.json_file:
                raise UserError("请选择要导入的 JSON 文件")
            
            # Decode base64 file content
            file_content = base64.b64decode(self.json_file)
            try:
                json_data = file_content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    json_data = file_content.decode('utf-8-sig')  # Handle BOM
                except UnicodeDecodeError:
                    raise UserError("文件编码不支持，请使用 UTF-8 编码的文件")
            
            return json_data
        
        elif self.import_mode == 'text':
            if not self.json_text:
                raise UserError("请输入 JSON 文本内容")
            return self.json_text
        
        else:
            raise UserError("无效的导入模式")

    @api.onchange('import_mode')
    def _onchange_import_mode(self):
        """Clear preview when changing import mode"""
        self.show_preview = False
        self.preview_data = False