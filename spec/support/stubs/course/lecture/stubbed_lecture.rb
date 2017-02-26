# frozen_string_literal: true
module Course::StubbedLecture
  private

  def create_classroom
    update! classroom_id: 1
  end

  def generate_classroom_link(user, is_instructor)
    link = "https://lecture_link_#{id}.com"
    update! instructor_classroom_link: link if is_instructor
    [link, nil]
  end
end

Course::Lecture.class_eval do
  prepend Course::StubbedLecture
end
