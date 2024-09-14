# frozen_string_literal: true
class Course::Assessment::LiveFeedbackSettings::SettingsController < \
  Course::Assessment::Controller
  def index
    @programming_questions = @assessment.programming_questions.includes(:language)
  end

  def edit
    enabled = live_feedback_params[:enabled]
    @programming_qns = @assessment.programming_questions

    raise ActiveRecord::Rollback unless @programming_qns.update_all(live_feedback_enabled: enabled) &&
                                        @programming_qns.each(&:create_codaveri_problem)
  end

  private

  def live_feedback_params
    params.required(:live_feedback_settings).permit(:enabled)
  end
end
