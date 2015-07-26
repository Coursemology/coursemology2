class Course::Assessment::QuestionsController < Course::Assessment::ComponentController
  before_action :authorize_assessment

  protected

  def authorize_assessment
    authorize!(:update, @assessment)
  end
end
