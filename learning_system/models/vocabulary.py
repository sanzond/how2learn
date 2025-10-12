from odoo import models, fields, api


class LearningVocabulary(models.Model):
    _name = 'learning.vocabulary'
    _description = 'Learning Vocabulary'
    _order = 'sequence, word'

    learning_set_id = fields.Many2one('learning.set', string='Learning Set', required=True, ondelete='cascade')
    word = fields.Char('Word', required=True, help="The vocabulary word")
    translation = fields.Char('Translation', required=True, help="Translation in target language")
    example = fields.Text('Example', help="Example sentence using this word")
    common_mistake = fields.Text('Common Mistake', help="Common mistakes to avoid")
    lambda_value = fields.Float('Lambda Value', default=10.0, help="Learning difficulty coefficient")
    sequence = fields.Integer('Sequence', default=10, help="Display order")
    active = fields.Boolean('Active', default=True)
    
    # Related fields
    cue_ids = fields.One2many('learning.cue', 'vocabulary_id', string='Learning Cues')
    
    # Computed fields
    cue_count = fields.Integer('Cues Count', compute='_compute_cue_count', store=True)

    @api.depends('cue_ids')
    def _compute_cue_count(self):
        for record in self:
            record.cue_count = len(record.cue_ids)

    def name_get(self):
        result = []
        for record in self:
            name = f"{record.word} ({record.translation})"
            result.append((record.id, name))
        return result

    def action_view_cues(self):
        """Open cues records for this vocabulary"""
        return {
            'type': 'ir.actions.act_window',
            'name': f'Learning Cues - {self.word}',
            'res_model': 'learning.cue',
            'view_mode': 'tree,form',
            'domain': [('vocabulary_id', '=', self.id)],
            'context': {
                'default_vocabulary_id': self.id,
                'search_default_vocabulary_id': self.id,
            },
            'target': 'current',
        }