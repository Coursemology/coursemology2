# frozen_string_literal: true
json.(material, :id, :updated_at)
json.name format_inline_text(material.name)
json.url url_for([current_course, folder, material])
