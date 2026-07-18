# frozen_string_literal: true
module Course::AssessmentMarketplaceAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_admins_publish_to_marketplace if user&.administrator?
    allow_managers_access_marketplace if course_user&.manager_or_owner?
    super
  end

  private

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
