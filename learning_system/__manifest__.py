{
    'name': 'Learning System',
    'version': '16.0.1.0.1',
    'category': 'Education',
    'summary': 'Adaptive Learning System based on Rescorla-Wagner Theory',
    'description': """
        A comprehensive learning management system that provides:
        - Vocabulary and sentence learning management
        - Multi-modal learning approaches
        - Rescorla-Wagner theory implementation
        - RESTful API for external applications
        - Adaptive learning progress tracking
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'depends': ['base', 'web','mail'],
    'external_dependencies': {
        'python': ['requests'],
    },
    'data': [
        'security/ir.model.access.csv',
        'views/learning_set_views.xml',
        'views/vocabulary_views.xml',
        'views/sentence_views.xml',
        'views/cue_views.xml',
        'views/import_wizard_views.xml',
        'views/ai_config_views.xml',
        'views/ai_generator_views.xml',
        'views/ai_call_statistics_views.xml',
        'views/menu_views.xml',
        'data/demo_data.xml',
        'data/ai_config_data.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}