# frozen_string_literal: true
json.id material.id
json.updated_at material.updated_at&.iso8601
json.name format_inline_text(material.name)
json.url url_to_material(current_course, folder, material)
