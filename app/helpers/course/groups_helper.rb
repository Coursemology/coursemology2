module Course::GroupsHelper
  def group_manager_names(group)
    return t('.not_assigned') unless group
    group.group_users.manager.map { |group_user| group_user.course_user.name }.join(', ')
  end
end
