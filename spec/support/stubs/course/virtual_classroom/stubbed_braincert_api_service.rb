# frozen_string_literal: true
module Course::VirtualClassroom::StubbedBraincertApiService
  def initialize(virtual_classroom, _settings)
    @virtual_classroom = virtual_classroom
  end

  def fetch_recorded_videos
    [{ name: 'Video 1', id: 1 },
     { name: 'Video 2', id: 2 }]
  end

  def fetch_recorded_video_link(record_id)
    ["https://api.example.com/video/#{record_id}", nil]
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
