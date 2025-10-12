from odoo import models, fields, api
from odoo.exceptions import ValidationError


class LearningCue(models.Model):
    _name = 'learning.cue'
    _description = 'Learning Cue'
    _order = 'vocabulary_id, sequence, id'

    vocabulary_id = fields.Many2one('learning.vocabulary', string='Vocabulary', required=True, ondelete='cascade')
    cue_type_char = fields.Char('Cue Type', required=True, default='text',
                          help="Type of cue (e.g., context, synonym, time, feeling, image, pattern, anatomy, category, opposite, symptom, purpose, etc.)")
    text = fields.Text('Cue Text', required=True)
    strength = fields.Float('Strength', default=0.0, help="Initial strength of this cue")
    sequence = fields.Integer('Sequence', default=10)
    active = fields.Boolean('Active', default=True)

    # Computed fields
    learning_set_id = fields.Many2one('learning.set', string='Learning Set', 
                                     related='vocabulary_id.learning_set_id', store=True)

    @api.constrains('strength')
    def _check_strength(self):
        for record in self:
            if record.strength < 0:
                raise ValidationError("Cue strength must be non-negative")

    def name_get(self):
        result = []
        for record in self:
            name = f"{record.cue_type_char}: {record.text[:50]}"
            if len(record.text) > 50:
                name += "..."
            result.append((record.id, name))
        return result