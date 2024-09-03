# frozen_string_literal: true

class Course::Assessment::Submission::LiveFeedbackController <
  Course::Assessment::Submission::Controller
  def save_live_feedback
    live_feedback = Course::Assessment::LiveFeedback.find_by(id: params[:live_feedback_id])
    return head :bad_request if live_feedback.nil?

    feedback_files = params[:feedback_files]
    feedback_files.each do |file|
      filename = file[:path]
      file[:feedbackLines].each do |feedback_line|
        Course::Assessment::LiveFeedbackComment.create(
          code_id: live_feedback.code.find_by(filename: filename).id,
          line_number: feedback_line[:linenum],
          comment: feedback_line[:feedback]
        )
      end
    end
  end
end
