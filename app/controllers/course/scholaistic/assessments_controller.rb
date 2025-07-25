# frozen_string_literal: true
class Course::Scholaistic::AssessmentsController < Course::Scholaistic::Controller
  include Course::Scholaistic::AssessmentsSyncConcern

  load_and_authorize_resource :assessment, class: Course::Scholaistic::Assessment.name, through: :course

  before_action :sync_scholaistic_assessments!, only: [:index]

  def index
    byebug
  end
end
