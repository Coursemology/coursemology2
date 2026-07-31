# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Controller < \
  Course::Assessment::Submission::Controller
  load_resource :answer, class: 'Course::Assessment::Answer', through: :submission
  load_resource :actable, class: 'Course::Assessment::Answer::Scribing',
                          singleton: true, through: :answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  protected

  # Answering is the whole point of a preview, and every action in this subtree — saving an answer,
  # uploading a text-response file, adding a scribble, annotating code — is reached through
  # `load_and_authorize_resource :submission`, which the preview ability confines to
  # `creator_id: user.id`. Claimed once on the base rather than per subclass, so a new answer type
  # does not silently break previews. Declared here and not on
  # `Course::Assessment::Submission::Controller`, which would also hand a previewer the access logs.
  def preview_sandbox_accessible?
    true
  end
end
