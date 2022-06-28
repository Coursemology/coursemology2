# frozen_string_literal: true

# course_user comes from @user_options which only plucks(:id, :name)
json.id course_user[0]
json.name course_user[1]
