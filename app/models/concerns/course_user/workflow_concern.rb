# frozen_string_literal: true
module CourseUser::WorkflowConcern
  # Transitions the user from the invited to the accepted state.
  #
  # @param [User] user The user which is accepting this invitation.
  # @return [void]
  def accept(user)
    self.user = user
  end

  # Callback handler for workflow state change to the rejected state.
  def on_rejected_entry(*)
    destroy
  end
end
