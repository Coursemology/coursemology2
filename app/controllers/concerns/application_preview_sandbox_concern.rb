# frozen_string_literal: true
# Confines a marketplace previewer to the preview flow, at the request layer.
#
# On the preview instance a non-administrator may reach only what a controller
# explicitly claims. `preview_sandbox_accessible?` defaults to false and is overridden by the handful
# of actions the preview flow actually makes, mirroring how `publicly_accessible?` marks out the
# unauthenticated surface.
#
module ApplicationPreviewSandboxConcern
  extend ActiveSupport::Concern

  included do
    before_action :enforce_preview_sandbox_lock!

    # The root payload reports the lock to the courseless navigation shell, which has no course to read
    # a flag off — the 404 page drops its "go back home" link on it. One fact, one source: the same
    # predicate this concern enforces, rather than a second guess at who is confined.
    helper_method :preview_sandbox_locked?
  end

  protected

  # Whether this action belongs to the marketplace preview flow, and may therefore run for a
  # non-administrator on the preview instance. Deny by default; override in the controllers that serve
  # the flow.
  #
  # Devise is exempt wholesale rather than by action: sign-in, sign-up, password reset and
  # confirmation all happen on the preview host, so a previewer who arrives without a session must be
  # able to complete them or the sandbox is unreachable. Exempting the base class cannot miss one of
  # the four subclasses.
  #
  # The root payload (locale, time zone, and the courses the user is in — here, only the container) is
  # fetched on every page, the previewer's included. Singled out the same way `publicly_accessible?`
  # singles out that one action.
  #
  # @return [Boolean]
  def preview_sandbox_accessible?
    devise_controller? || (controller_name == 'application' && action_name.to_sym == :index)
  end

  # Whether `assessment_id` names an assessment a previewer was actually handed: the snapshot a listed
  # listing currently serves.
  #
  # Deliberately no `can?` call. This runs before `load_and_authorize_resource :course`, and
  # `Course::Controller#current_ability` memoizes on `current_course`; building the ability here would
  # freeze a nil-course one for the rest of the request and deny the previewer everything downstream.
  #
  # @param [Integer, String, nil] assessment_id
  # @return [Boolean]
  def previewable_assessment?(assessment_id)
    Course::Assessment::Marketplace::Listing.serving_assessment?(assessment_id)
  end

  private

  def enforce_preview_sandbox_lock!
    return unless preview_sandbox_locked?
    return if preview_sandbox_accessible?

    raise CanCan::AccessDenied
  end

  def preview_sandbox_locked?
    return false if current_user&.administrator?

    Course::Assessment::Marketplace::PreviewContainerService.preview_instance?(current_tenant)
  end
end
