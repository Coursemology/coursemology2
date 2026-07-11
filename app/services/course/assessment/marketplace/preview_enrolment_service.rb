# frozen_string_literal: true
class Course::Assessment::Marketplace::PreviewEnrolmentService
  def self.ensure_manager!(course:, user:)
    # Identity attrs only in find_or_create_by!; role/name/creator in the block
    CourseUser.find_or_create_by!(course: course, user: user) do |cu|
      cu.role = :manager
      cu.name = user.name
      cu.creator = user
      cu.updater = user
    end
  end
end
