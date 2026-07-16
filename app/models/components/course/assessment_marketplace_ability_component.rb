# frozen_string_literal: true
module Course::AssessmentMarketplaceAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_admins_publish_to_marketplace if user&.administrator?
    if course_user&.manager_or_owner?
      if marketplace_visible_to_user?
        allow_managers_access_marketplace
      else
        # `Course::CourseAbilityComponent` grants managers/owners a blanket `can :manage, Course`,
        # which (CanCan's `:manage` matches any action) would otherwise satisfy
        # `:access_marketplace` regardless of the allow-list. This component runs after that one
        # in the `define_permissions` super chain, so a `cannot` here takes precedence.
        cannot :access_marketplace, Course, id: course.id
      end
    end
    super
  end

  private

  def marketplace_visible_to_user?
    user&.administrator? || Course::Assessment::Marketplace::AllowlistRule.grants_access?(user)
  end

  def allow_admins_publish_to_marketplace
    can :publish_to_marketplace, Course::Assessment
  end

  def allow_managers_access_marketplace
    can :access_marketplace, Course, id: course.id
    can :duplicate_from_marketplace, Course::Assessment do |assessment|
      assessment.marketplace_listing&.published? || false
    end
    can :preview_in_marketplace, Course::Assessment do |assessment|
      assessment.marketplace_listing&.published? || false
    end
  end
end
