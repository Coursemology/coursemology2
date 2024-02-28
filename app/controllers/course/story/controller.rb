# frozen_string_literal: true
class Course::Story::Controller < Course::ComponentController
  load_and_authorize_resource :story, through: :course, class: Course::Story.name, except: [:new]

  private

  def component
    current_component_host[:course_stories_component]
  end
end
