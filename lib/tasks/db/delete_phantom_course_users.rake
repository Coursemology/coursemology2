# frozen_string_literal: true
namespace :db do
  task delete_phantom_course_users: :environment do
    ActsAsTenant.without_tenant do
      course_id = 2183
      course = Course.find(course_id)
      phantom_course_users = course.course_users.students.phantom
      total_course_users = phantom_course_users.count

      ActiveRecord::Base.transaction do
        phantom_course_users.each_with_index do |cu, index|
          puts "Deleting #{cu.name} (course_user_id: #{cu.id}) - #{index + 1}/#{total_course_users}"
          cu.destroy!
        end
      end
    end
  end
end
