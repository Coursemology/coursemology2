# frozen_string_literal: true
json.courseRegistrationKey current_course.registration_key.to_s
json.templatePath asset_path('course_user_invitation_template.csv')
