# frozen_string_literal: true
class Course::LeaderboardsController < Course::ComponentController
  before_action :check_component
  before_action :load_settings
  before_action :add_leaderboard_breadcrumb

  def show #:nodoc:
  end

  private

  # Ensure that the component is enabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    raise ComponentNotFoundError unless component
  end

  # Load current component's settings
  def load_settings
    @leaderboard_settings = component.settings
  end

  def add_leaderboard_breadcrumb
    add_breadcrumb @leaderboard_settings.title || :index, :course_leaderboard_path
  end

  # @return [Course::LeaderboardComponent] The leaderboard component.
  # @return [nil] If leaderboard component is disabled.
  def component
    current_component_host[:course_leaderboard_component]
  end
end
