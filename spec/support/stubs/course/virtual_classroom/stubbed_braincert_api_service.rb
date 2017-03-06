# frozen_string_literal: true
module Course::VirtualClassroom::StubbedBraincertApiService
  def initialize(virtual_classroom, _settings)
    @virtual_classroom = virtual_classroom
  end

  private

  def create_classroom
    @virtual_classroom.update! classroom_id: 1
  end

  def generate_classroom_link(_user, is_instructor)
    link = "https://virtual_classroom_link_#{@virtual_classroom.id}.com"
    @virtual_classroom.update! instructor_classroom_link: link if is_instructor
    [link, nil]
  end
end

Course::VirtualClassroom::BraincertApiService.class_eval do
  prepend Course::VirtualClassroom::StubbedBraincertApiService
end
