# frozen_string_literal: true
json.id announcement.id
json.title announcement.title
json.content format_ckeditor_rich_text(announcement.content)
json.startTime announcement.start_at
