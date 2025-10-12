from odoo import models, fields, api
import json


class LearningSentence(models.Model):
    _name = 'learning.sentence'
    _description = 'Learning Sentence'
    _order = 'sequence, sentence_id'

    learning_set_id = fields.Many2one('learning.set', string='Learning Set', required=True, ondelete='cascade')
    sentence_id = fields.Integer('Sentence ID', required=True, help="Unique ID within the learning set")
    title = fields.Char('Title', required=True, help="Descriptive title for the sentence")
    sentence = fields.Text('Sentence', required=True, help="The actual sentence content")
    
    # Prediction fields
    prediction_question = fields.Text('Prediction Question', required=True, 
                                    help="Question to test prediction understanding")
    wrong_options = fields.Text('Wrong Options', help="Wrong answer options (one per line)")
    correct_answer = fields.Text('Correct Answer', required=True, help="The correct answer")
    explanation = fields.Text('Explanation', required=True, help="Explanation of the correct answer")
    
    # Grammar fields
    grammar_pattern = fields.Char('Grammar Pattern', help="Grammar pattern description")
    grammar_breakdown = fields.Text('Grammar Breakdown', help="JSON format breakdown of grammar components")
    
    # Learning parameters
    lambda_value = fields.Float('Lambda Value', default=10.0, help="Learning difficulty coefficient")
    sequence = fields.Integer('Sequence', default=10, help="Display order")
    active = fields.Boolean('Active', default=True)

    @api.model
    def create(self, vals):
        # Auto-generate sentence_id if not provided
        if 'sentence_id' not in vals and 'learning_set_id' in vals:
            existing_sentences = self.search([('learning_set_id', '=', vals['learning_set_id'])])
            if existing_sentences:
                max_id = max(existing_sentences.mapped('sentence_id'))
                vals['sentence_id'] = max_id + 1
            else:
                vals['sentence_id'] = 1
        return super().create(vals)

    def name_get(self):
        result = []
        for record in self:
            name = f"{record.sentence_id}. {record.title}"
            result.append((record.id, name))
        return result

    @api.onchange('grammar_breakdown')
    def _onchange_grammar_breakdown(self):
        """Validate JSON format for grammar breakdown"""
        if self.grammar_breakdown:
            try:
                json.loads(self.grammar_breakdown)
            except json.JSONDecodeError:
                return {
                    'warning': {
                        'title': 'Invalid JSON',
                        'message': 'Grammar breakdown must be valid JSON format'
                    }
                }

    def get_wrong_options_list(self):
        """Return wrong options as a list"""
        if self.wrong_options:
            return [option.strip() for option in self.wrong_options.split('\n') if option.strip()]
        return []

    def get_grammar_breakdown_dict(self):
        """Return grammar breakdown as dictionary"""
        if self.grammar_breakdown:
            try:
                return json.loads(self.grammar_breakdown)
            except json.JSONDecodeError:
                return {}
        return {}