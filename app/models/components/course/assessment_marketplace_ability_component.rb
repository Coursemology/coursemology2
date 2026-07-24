# frozen_string_literal: true
module Course::AssessmentMarketplaceAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_admins_publish_to_marketplace if user&.administrator?
    # System admins keep marketplace access via `can :manage, :all` (Ability#initialize); do not
    # emit a `cannot` for them or it would revoke that. For everyone else, access is per-person.
    if course && !user&.administrator?
      if can_access_marketplace?
        allow_managers_access_marketplace
      else
        # `Course::CourseAbilityComponent` grants managers/owners a blanket `can :manage, Course`,
        # which (CanCan's `:manage` matches any action) would otherwise satisfy `:access_marketplace`
        # regardless of the allow-list. This component runs after that one in the `define_permissions`
        # super chain, so a `cannot` here takes precedence. This line is load-bearing.
        cannot :access_marketplace, Course, id: course.id
      end
    end
    super
  end

  private

  # Access is per-person, not per-current-course-role: anyone who is baseline-capable (manages/owns
  # >=1 course anywhere, OR is an instructor/administrator in any instance) and passes the allow-list
  # may browse, whatever their role in the course they are viewing.
  def can_access_marketplace?
    marketplace_baseline_capable? && marketplace_visible_to_user?
  end

  # The two peer baseline capabilities for the marketplace. Either qualifies; the allow-list narrows.
  def marketplace_baseline_capable?
    user&.course_manager_or_owner? || user&.instance_instructor_or_administrator?
  end

  # Part of the TEMPORARY allow-list gate (see the retirement seam on `can_access_marketplace?`).
  # When the allow-list is retired this whole method is deleted; the block check goes with it.
  def marketplace_visible_to_user?
    return true if user&.administrator?

    Course::Assessment::Marketplace::AllowlistRule.grants_access?(user) &&
      !Course::Assessment::Marketplace::AccessBlock.blocked?(user)
  end


  def allow_admins_publish_to_marketplace
    can :publish_to_marketplace, Course::Assessment
  end

  def allow_managers_access_marketplace # rubocop:disable Metrics/AbcSize
    can :access_marketplace, Course, id: course.id
    can :duplicate_from_marketplace, Course::Assessment do |assessment|
      assessment.marketplace_listing&.published? || false
    end
    can :preview_in_marketplace, Course::Assessment do |assessment|
      assessment.marketplace_listing&.published? || false
    end

    # Marketplace preview serving. Subject is Course::Assessment::Attempt (not a separate
    # model). Block conditions gate on `preview?` (no extension row) + creator ownership, so real
    # attempts — served via Submission and gated by AssessmentAbility — are never over-granted here.
    #
    # `:create` is class-level (CanCan can't evaluate a block without an instance); the published-listing
    # scoping of creation lives in PreviewAttemptsController#authorize_attempt!, not here. It cannot
    # over-authorize real submissions: those authorize `:attempt` on the assessment, never `:create` on
    # Attempt.
    can :create, Course::Assessment::Attempt
    can [:read, :update, :grade, :reset, :reload_answer, :reevaluate_answer, :generate_feedback,
         :generate_live_feedback, :create_live_feedback_chat, :fetch_live_feedback_chat,
         :fetch_live_feedback_status, :save_live_feedback, :create_scribing_scribble, :read_tests,
         :save_draft, :submit_answer],
        Course::Assessment::Attempt do |attempt|
      attempt.preview? && attempt.creator_id == user.id
    end
    # `Course::Assessment::Answer::UpdateAnswerConcern` gates answer-editing/grading params behind
    # `can?(:update/:grade, answer)` on the ANSWER — without this, PATCH .../attempt/:id would silently
    # drop every answer param for a preview-owned answer. Block form (not a hash) because a preview is the
    # absence of an extension; `answer.submission` is the Attempt.
    can [:update, :grade], Course::Assessment::Answer do |answer|
      answer.submission.preview? && answer.submission.creator_id == user.id
    end
  end
end