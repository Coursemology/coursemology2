# frozen_string_literal: true

json.id course.id
json.title course.title
json.description format_ckeditor_rich_text(course.description)
json.logoUrl display_course_logo(course)
