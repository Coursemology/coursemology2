# frozen_string_literal: true
module FrontendTestHelpers
  def test_new_assessment_question_flow(course, assessment, question_type)
    visit course_assessment_path(course, assessment)
    click_on 'New Question'

    # Need to wait for the animation to finish, since the dropdown menu starts small and gradually scales itself up.
    # If link is clicked mid-animation, it can result in going to the wrong question type (off-by-one).
    wait_for_animation
    window_opened_by { click_link question_type }
  end
end

RSpec.configure do |config|
  config.include FrontendTestHelpers, type: :feature
end
