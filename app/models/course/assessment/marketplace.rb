# frozen_string_literal: true
module Course::Assessment::Marketplace
  CONTAINER_TITLE = 'Marketplace Version Store'

  def self.table_name_prefix
    'course_assessment_marketplace_'
  end

  # The single, hidden, system-wide container Course that stores every published
  # version snapshot. Located via a settings pointer on the default instance (no
  # `courses` column, per design V4). Find-or-heals: (re)creates and re-persists
  # the pointer if it is unset or references a missing course. Runs without a
  # tenant because callers may be scoped to any instance.
  #
  # @return [Course]
  def self.container
    ActsAsTenant.without_tenant do
      instance = Instance.default
      id = instance.settings(:marketplace).container_course_id
      (id && Course.find_by(id: id)) || create_container!(instance)
    end
  end

  # @return [Course]
  def self.create_container!(instance)
    ActsAsTenant.with_tenant(instance) do
      User.with_stamper(User.system) do
        course = Course.create!(instance: instance, title: CONTAINER_TITLE,
                                description: 'System store for marketplace version snapshots.',
                                published: false, gamified: false, enrollable: false,
                                creator: User.system, updater: User.system)
        instance.settings(:marketplace).container_course_id = course.id
        instance.save!
        course
      end
    end
  end
  private_class_method :create_container!
end
