# frozen_string_literal: true
class Course::DuplicationsController < Course::ComponentController
  before_action :authorize_duplication

  def show; end

  def create
    if duplicate
      redirect_to course_duplication_path(current_course), success: t('.duplicating')
    else
      redirect_to course_duplication_path(current_course), danger: t('.failed')
    end
  end

  protected

  def authorize_duplication
    authorize!(:duplicate, current_course)
  end

  private

  def create_duplication_params # :nodoc
    params.require(:duplication).permit(:new_course_start_date, :new_course_title)
  end

  # Creates a duplication job for the course
  #
  # @return [Boolean] True if the duplication was successful.
  def duplicate
    # when selectable duplication is implemented, pass in additional arrays for all_objects
    # and selected_objects
    job = Course::DuplicationJob.perform_later(current_course, current_user,
                                               create_duplication_params).job
  end
end
