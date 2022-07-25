# frozen_string_literal: true
namespace :db do
  task delete_phantom_course_users: :environment do
    ActsAsTenant.without_tenant do
      puts 'Input course id:'
      course_id = $stdin.gets.strip
      course = Course.find(course_id.to_i)

      puts "Are you sure you wish to remove phantom course users from the course #{course.title}? (Y/N): "
      confirm = $stdin.gets.strip
      if confirm == 'Y'
        phantom_course_users = course.course_users.students.phantom
        total_course_users = phantom_course_users.count

        ActiveRecord::Base.transaction do
          phantom_course_users.each_with_index do |cu, index|
            puts "Deleting #{cu.name} (course_user_id: #{cu.id}) - #{index + 1}/#{total_course_users}"
            cu.destroy!
          end
        end

        puts "Deleted #{total_course_users} users!"
      else
        puts 'Course user deletion cancelled!'
      end
    end
  end
end
