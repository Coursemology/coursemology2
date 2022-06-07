# frozen_string_literal: true
json.partial! 'user_basic_list_data', course_user: course_user
json.imageUrl user_image(course_user.user)
