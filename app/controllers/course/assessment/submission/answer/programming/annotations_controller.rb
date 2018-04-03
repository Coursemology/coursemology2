# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::AnnotationsController < \
  Course::Assessment::Submission::Answer::Programming::Controller

  load_resource :actable, class: Course::Assessment::Answer::Programming.name,
                          singleton: true, through: :answer
  before_action :set_programming_answer
  load_resource :file, class: Course::Assessment::Answer::ProgrammingFile.name,
                       through: :programming_answer
  before_action :load_existing_annotation
  load_resource :annotation, class: Course::Assessment::Answer::ProgrammingFileAnnotation.name,
                             through: :file

  helper Course::Assessment::Answer::ProgrammingHelper.name.sub(/Helper$/, '')

  include Course::Discussion::PostsConcern

  def create
    result = @annotation.class.transaction do
      @post.title = @assessment.title

      raise ActiveRecord::Rollback unless @post.save && create_topic_subscription && update_topic_pending_status
      raise ActiveRecord::Rollback unless @annotation.save
      true
    end

    if result
      send_created_notification(@post)
      render_create_response
    else
      head :bad_request
    end
  end

  private

  def annotation_params
    params.require(:annotation).permit(:line)
  end

  def load_existing_annotation
    @annotation ||= begin
      line = line_param
      return unless line

      @file.annotations.find_by(line: line.to_i)
    end
  end

  def line_param
    line = params[:line]
    line ||= params.key?(:annotation) && annotation_params[:line]
    line
  end

  def discussion_topic
    @annotation.discussion_topic
  end

  def create_topic_subscription
    @discussion_topic.ensure_subscribed_by(current_user)
    # Ensure the student who wrote the code gets notified when someone comments on his code
    @discussion_topic.ensure_subscribed_by(@answer.submission.creator)

    # Ensure all group managers get a notification when someone adds a programming annotation
    # to the answer.
    answer_course_user = @answer.submission.course_user
    answer_course_user.my_managers.each do |manager|
      @discussion_topic.ensure_subscribed_by(manager.user)
    end
  end

  def send_created_notification(post)
    return unless current_course_user && !current_course_user.phantom?
    post.topic.actable.notify(post)
  end

  def render_create_response
    respond_to do |format|
      format.js
      format.json { render partial: @post }
    end
  end
end
