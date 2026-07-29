# frozen_string_literal: true
module Course::AssessmentMarketplaceAbilityComponent
  include AbilityHost::Component

  # Question types whose create/edit/delete are frozen inside a `preview` course. Mirrors the set
  # granted in Course::Assessment::AssessmentAbility#allow_manage_questions.
  PREVIEW_FROZEN_QUESTION_TYPES = [
    Course::Assessment::Question::ForumPostResponse,
    Course::Assessment::Question::MultipleResponse,
    Course::Assessment::Question::TextResponse,
    Course::Assessment::Question::Programming,
    Course::Assessment::Question::RubricBasedResponse,
    Course::Assessment::Question::Scribing,
    Course::Assessment::Question::VoiceResponse
  ].freeze

  def define_permissions
    allow_admins_publish_to_marketplace if user&.administrator?
    # System admins keep marketplace access via `can :manage, :all` (Ability#initialize); do not
    # emit a `cannot` for them or it would revoke that. For everyone else, access is per-person.
    define_non_admin_course_permissions if course && !user&.administrator?
    super
  end

  private

  def define_non_admin_course_permissions
    if can_access_marketplace?
      allow_managers_access_marketplace
    else
      # `Course::CourseAbilityComponent` grants managers/owners a blanket `can :manage, Course`,
      # which (CanCan's `:manage` matches any action) would otherwise satisfy `:access_marketplace`
      # regardless of the allow-list. This component runs after that one in the `define_permissions`
      # super chain, so a `cannot` here takes precedence. This line is load-bearing.
      cannot :access_marketplace, Course, id: course.id
    end
    restrict_preview_course_content if course.preview?
  end

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

  # Part of the temporary allow-list gate (see the retirement seam on `can_access_marketplace?`).
  # When the allow-list is retired this whole method is deleted; the block check goes with it.
  def marketplace_visible_to_user?
    return true if user&.administrator?

    Course::Assessment::Marketplace::AllowlistRule.grants_access?(user) &&
      !Course::Assessment::Marketplace::AccessBlock.blocked?(user)
  end

  def allow_admins_publish_to_marketplace
    can :publish_to_marketplace, Course::Assessment
  end

  # In a `preview` sandbox course, freeze assessment content for everyone except system administrators
  # (who hold `can :manage, :all`). Previewers are enrolled as `manager` — the lowest role that can
  # attempt, grade and publish — which also carries `can :manage, Course::Assessment` and question
  # management, so revoke exactly the destructive/content verbs and leave that loop intact.
  #
  # These `cannot`s only take precedence because this runs after Course::AssessmentsAbilityComponent
  # and Course::CourseAbilityComponent in the `define_permissions` super chain: AbilityHost.components
  # is ordered by file path, and `_` (0x5F) sorts before `s` (0x73). Do not rename or move this file.
  def restrict_preview_course_content
    assessments_in_course = { tab: { category: { course_id: course.id } } }
    cannot [:update, :destroy], Course::Assessment, assessments_in_course
    cannot :delete_all_submissions, Course::Assessment, assessments_in_course
    cannot :delete_submission, Course::Assessment::Submission, assessment: assessments_in_course
    PREVIEW_FROZEN_QUESTION_TYPES.each do |question_class|
      cannot [:create, :update, :destroy], question_class
    end
  end

  def allow_managers_access_marketplace
    can :access_marketplace, Course, id: course.id
    # Subject is the listing, not the assessment (design V13). Resolving it from an assessment would
    # go through `Course::Assessment has_one :marketplace_listing`, which keys on
    # `authoring_assessment_id` — but the assessment these actions serve is the container snapshot,
    # never the authoring copy. Keying on the listing also survives orphaning, where it is gone.
    can :duplicate_from_marketplace, Course::Assessment::Marketplace::Listing, &:published?
    can :preview_in_marketplace, Course::Assessment::Marketplace::Listing, &:published?
  end
end
