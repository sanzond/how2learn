# -*- coding: utf-8 -*-

def migrate(cr, version):
    """
    Migration script to handle cue_type_char field type change from Selection to Char
    """
    if not version:
        return
    
    # Check if the cue_type field exists and is of Selection type
    cr.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'learning_cue' 
        AND column_name = 'cue_type'
    """)
    
    result = cr.fetchone()
    if result:
        # The field exists, we need to handle the type change
        # First, let's see what values are currently in the database
        cr.execute("SELECT DISTINCT cue_type FROM learning_cue")
        existing_values = [row[0] for row in cr.fetchall()]
        
        # Create a temporary column to store the data
        cr.execute("ALTER TABLE learning_cue ADD COLUMN cue_type_temp VARCHAR")
        
        # Copy existing data to temp column
        cr.execute("UPDATE learning_cue SET cue_type_temp = cue_type")
        
        # Drop the old column
        cr.execute("ALTER TABLE learning_cue DROP COLUMN cue_type")
        
        # Rename temp column to original name
        cr.execute("ALTER TABLE learning_cue RENAME COLUMN cue_type_temp TO cue_type")
        
        # Set NOT NULL constraint and default value
        cr.execute("ALTER TABLE learning_cue ALTER COLUMN cue_type SET NOT NULL")
        cr.execute("ALTER TABLE learning_cue ALTER COLUMN cue_type SET DEFAULT 'text'")