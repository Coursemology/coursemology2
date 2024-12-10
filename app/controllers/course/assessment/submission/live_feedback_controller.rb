# frozen_string_literal: true

class Course::Assessment::Submission::LiveFeedbackController <
  Course::Assessment::Submission::Controller
  def save_live_feedback
    live_feedback = Course::Assessment::LiveFeedback.find_by(id: params[:live_feedback_id])
    return head :bad_request if live_feedback.nil?

    message = params[:message]

    create_live_feedback_overall_comment_object(live_feedback, message[:content])
    create_live_feedback_annotation_comment_object(live_feedback, message[:files])
  end

  def create_live_feedback_overall_comment_object(live_feedback, content)
    Course::Assessment::LiveFeedbackComment.create(
      code_id: live_feedback.code.first.id,
      line_number: 0,
      comment: content
    )
  end

  def create_live_feedback_annotation_comment_object(live_feedback, files)
    files.each do |file|
      filename = file[:path]
      live_feedback_code = live_feedback.code.find_by(filename: filename)

      next unless live_feedback_code

      file[:annotations].each do |line|
        Course::Assessment::LiveFeedbackComment.create(
          code_id: live_feedback_code.id,
          line_number: line[:line],
          comment: line[:content]
        )
      end
    end
  end
end
