# frozen_string_literal: true
class Course::Group::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, class: Course::Group

  def update
    # TODO: Mass update the groups of a category
  end

  def destroy
    # TODO: Destroy group
  end
end
