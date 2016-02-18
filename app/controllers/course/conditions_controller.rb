# frozen_string_literal: true
class Course::ConditionsController < Course::ComponentController
  before_action :load_and_authorize_conditional
  helper_method :return_to_path

  # @return [String] The path to return to when successfully executing or failing an action,
  #         or when the user clicks on the `Back` button.
  # @return [Symbol] Similar to above.
  def return_to_path
    raise NotImplementedError, 'To be implemented by the condition controllers of a specific'\
      'conditional.'
  end

  # Set the instance variable `@conditional` that possesses the condition. The conditional id should
  # be retrieved from the path.
  #
  # For example, the path of some condition controller for an achievement (the conditional) is
  #     courses/1/achievements/1/condition/<condition_nam>/<condition_id>/<action>`
  # To retrieve and set the conditional,
  #     @conditional = Course::Achievement.find(params[:achievement_id])
  def set_conditional
    raise NotImplementedError, 'To be implemented by the condition controllers of a specific'\
      'conditional.'
  end

  def authorize_conditional
    authorize! :read, @conditional
  end

  def load_and_authorize_conditional
    set_conditional
    authorize_conditional
  end
end
