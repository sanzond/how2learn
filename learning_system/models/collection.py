from odoo import models, fields, api
from datetime import datetime

class LearningCollection(models.Model):
    _name = 'learning.collection'
    _description = 'Learning Collection'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    # 基本字段
    sequence = fields.Integer('排序号', default=10, help="显示顺序")
    description = fields.Text('简介', help="合集简介（选填）")
    cover_image = fields.Binary('合集封面图', help="合集封面图片")
    name = fields.Char('合集名称', required=True, help="合集名称")
    category = fields.Selection([
        ('vocabulary', '词汇'),
        ('sentence', '句子'),
        ('grammar', '语法'),
        ('reading', '阅读'),
        ('listening', '听力'),
        ('writing', '写作')
    ], string='类别', required=True, default='sentence')
    
    # 统计字段
    content_count = fields.Integer('当前内容数', compute='_compute_content_count', store=True)
    last_update = fields.Datetime('最后更新', compute='_compute_last_update', store=True)
    
    # 设置字段
    continuous_reading = fields.Selection([
        ('enabled', '已开启'),
        ('not_supported', '暂不支持'),
        ('disabled', '关闭')
    ], string='文末连续阅读', default='enabled')
    
    collection_link = fields.Char('合集链接', help="合集外部链接")
    
    # 关联字段
    set_ids = fields.One2many('learning.set', 'collection_id', string='关联学习集')
    
    # 计算字段
    @api.depends('set_ids')
    def _compute_content_count(self):
        for record in self:
            record.content_count = len(record.set_ids)
    
    @api.depends('set_ids.write_date')
    def _compute_last_update(self):
        for record in self:
            if record.set_ids:
                record.last_update = max(record.set_ids.mapped('write_date'))
            else:
                record.last_update = False
    
    def name_get(self):
        result = []
        for record in self:
            name = f"{record.sequence}. {record.name}"
            result.append((record.id, name))
        return result