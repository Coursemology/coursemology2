class Course::DuplicationsController < Course::ComponentController
  def show
  end

  def create
    if duplicate
      redirect_to course_duplication_path(current_course), success: t('.duplicating')
    else
      redirect_to course_duplication_path(current_course), danger: t('.failed')
    end
  end

  private

  def create_duplication_params # :nodoc
    params.require(:duplication).require(:new_course_start_time)
  end

  # Duplicates the course via the service object
  #
  # @return [Boolean] True if the duplication was successful.
  def duplicate
    duplication_service.duplicate
  end

  # Create a duplication service object for this object.
  #
  # @return [Course::DuplicationService]
  def duplication_service
    # when selectable duplication is implemented, pass in additional arrays for all_objects
    # and selected_objects
    @duplication_service ||= Course::DuplicationService.new(
      current_course, new_course_start_date: Time.zone.parse(create_duplication_params)
    )
  end
end
