# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Controller < \
  Course::Assessment::Submission::Controller
  load_resource :answer, class: 'Course::Assessment::Answer', through: :submission
  load_resource :actable, class: 'Course::Assessment::Answer::Scribing',
                          singleton: true, through: :answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  protected

  # Every action in this subtree (saving an answer, uploading a text-response file, adding a scribble, annotating code)
  # is reached through `load_and_authorize_resource :submission`, which the preview ability confines to
  # `creator_id: user.id`. Claimed once on the base rather than per subclass, so a new answer type
  # does not silently break previews.
  def preview_sandbox_accessible?
    true
  end
end
