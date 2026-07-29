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

  # In a `preview` sandbox course, freeze the assessment CONTENT for everyone except system
  # administrators (who hold `can :manage, :all` from Ability#initialize). Previewers are enrolled as
  # `manager` (the lowest role that can attempt+grade+publish), which ALSO carries
  # `can :manage, Course::Assessment` + question management — so we revoke exactly the
  # destructive/content verbs while leaving the attempt/grade/publish loop intact.
  #
  # This runs AFTER Course::AssessmentsAbilityComponent and Course::CourseAbilityComponent in the
  # `define_permissions` super chain (AbilityHost.components is ordered by alphabetical file path, and
  # `assessment_marketplace_ability_component.rb` sorts before both `assessments_...` and `course_...`
  # because `_` (0x5F) < `s` (0x73)), so these `cannot`s take precedence. This ordering is
  # load-bearing — do not rename or move this file. The admin exemption is enforced at the call site.
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
    # Subject is the LISTING, not the assessment (design V13). Resolving the listing from an
    # assessment would go through `Course::Assessment has_one :marketplace_listing`, which keys on
    # `authoring_assessment_id` — and the assessment these actions serve is the container SNAPSHOT,
    # which is never the authoring copy. Keying on the listing also keeps the check working for an
    # orphaned listing, whose authoring assessment is gone entirely.
    # This decoupling also survives restore-into-container: the container now holds a working copy as
    # well as snapshots, and keying on the listing means neither is resolved through the assessment.
    can :duplicate_from_marketplace, Course::Assessment::Marketplace::Listing, &:published?
    can :preview_in_marketplace, Course::Assessment::Marketplace::Listing, &:published?
  end
end
