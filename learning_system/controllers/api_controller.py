from odoo import http
from odoo.http import request
import json


class LearningSystemAPI(http.Controller):

    @http.route('/api/learning/data', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_learning_data(self):
        """API endpoint to get all learning data in JSON format"""
        try:
            learning_set_model = request.env['learning.set'].sudo()
            data = learning_set_model.get_learning_data_api()
            
            return request.make_response(
                json.dumps(data, indent=2, ensure_ascii=False),
                headers=[
                    ('Content-Type', 'application/json'),
                    ('Access-Control-Allow-Origin', '*'),
                    ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                    ('Access-Control-Allow-Headers', 'Content-Type'),
                ]
            )
        except Exception as e:
            error_response = {
                'error': 'Failed to fetch learning data',
                'message': str(e)
            }
            return request.make_response(
                json.dumps(error_response),
                status=500,
                headers=[('Content-Type', 'application/json')]
            )

    @http.route('/api/learning/sets', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_learning_sets(self):
        """API endpoint to get learning sets metadata"""
        try:
            learning_sets = request.env['learning.set'].sudo().search([('active', '=', True)])
            sets_data = []
            
            for learning_set in learning_sets:
                sets_data.append({
                    'id': learning_set.id,
                    'name': learning_set.name,
                    'description': learning_set.description,
                    'full_text': learning_set.full_text,
                    'vocabulary_count': learning_set.vocabulary_count,
                    'sentence_count': learning_set.sentence_count,
                    'user': learning_set.user
                })
            
            return request.make_response(
                json.dumps(sets_data, indent=2, ensure_ascii=False),
                headers=[
                    ('Content-Type', 'application/json'),
                    ('Access-Control-Allow-Origin', '*'),
                ]
            )
        except Exception as e:
            error_response = {
                'error': 'Failed to fetch learning sets',
                'message': str(e)
            }
            return request.make_response(
                json.dumps(error_response),
                status=500,
                headers=[('Content-Type', 'application/json')]
            )

    @http.route('/api/learning/set/<int:set_id>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_learning_set(self, set_id):
        """API endpoint to get specific learning set data"""
        try:
            learning_set = request.env['learning.set'].sudo().browse(set_id)
            if not learning_set.exists():
                return request.make_response(
                    json.dumps({'error': 'Learning set not found'}),
                    status=404,
                    headers=[('Content-Type', 'application/json')]
                )
            
            data = learning_set.export_to_json()
            
            return request.make_response(
                json.dumps(data, indent=2, ensure_ascii=False),
                headers=[
                    ('Content-Type', 'application/json'),
                    ('Access-Control-Allow-Origin', '*'),
                ]
            )
        except Exception as e:
            error_response = {
                'error': 'Failed to fetch learning set',
                'message': str(e)
            }
            return request.make_response(
                json.dumps(error_response),
                status=500,
                headers=[('Content-Type', 'application/json')]
            )

    @http.route('/api/learning/progress', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def save_learning_progress(self):
        """API endpoint to save learning progress (future implementation)"""
        # This can be implemented later to track user progress
        return {'status': 'success', 'message': 'Progress saved'}