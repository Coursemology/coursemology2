class Course::GroupsController < Course::ModuleController
  load_and_authorize_resource through: :course
  helper_method :localized_role

  def index
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    redirect_to new_course_group_path(@course), flash: error_msg(@group.errors) unless update_group
  end

  def edit #:nodoc:
    @in_group = @course.course_users.select do |course_user|
      course_user.user.groups.include? @group
    end

    @not_in_group = @course.course_users - @in_group
  end

  def update
    @group.update(group_params)
    redirect_to edit_course_group_path(@course, @group),
                flash: error_msg(@group.errors) unless update_group
  end

  def destroy
    @group.destroy
    redirect_to course_groups_path(@course), flash: notice_msg
  end

  def localized_role(role)
    t("course.groups.roles.#{role}")
  end

  private

  def group_params #:nodoc:
    params.require(:course_group).permit(:name)
  end

  def notice_msg #:nodoc:
    { notice: t('.notice') }
  end

  def error_msg(errors) #:nodoc:
    { error: t('.error_format', reason: errors.full_messages.join('; ')) }
  end

  def update_group
    return false unless @group.save
    remove_group_members
    msg = error_msg(@group.errors) unless add_group_members
    msg ||= notice_msg
    redirect_to edit_course_group_path(@course, @group), flash: msg
    true
  end

  def remove_group_members #:nodoc:
    params[:user_ids] ||= []
    @group.group_users.each do |group_user|
      group_user.destroy unless params[:user_ids].include?(group_user.user.id)
    end
  end

  def add_group_members #:nodoc:
    params[:user_ids] && params[:user_ids].each do |user_id|
      user = User.find_by_id(user_id)
      return false unless user_exist?(user, user_id) && user_enrolled?(user, user_id)
      @group.add_user(user)
    end
    true
  end

  def user_exist?(user, user_id) #:nodoc:
    unless user
      @group.errors[:user] << t('.user_not_found_format', email: params[:user_emails][user_id])
      return false
    end
    true
  end

  def user_enrolled?(user, user_id) #:nodoc:
    unless @course.users.include? user
      @group.errors[:user] << t('.user_not_enrolled_format', email: params[:user_emails][user_id])
      return false
    end
    true
  end
end
