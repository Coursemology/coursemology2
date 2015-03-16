class Course::EnrolRequestsController < Course::ModuleController
  load_and_authorize_resource through: :course

  def index #:nodoc:
    @staff_requests = @enrol_requests.staff
    @student_requests = @enrol_requests.student

    respond_to do |format|
      format.html
    end
  end

  def new #:nodoc:
    unless current_user
      redirect_to new_user_session_path
      return
    end

    unless @course.opened?
      redirect_to course_path(@course), flash: { error: t('.course_not_open') }
      return
    end

    if current_course_user
      redirect_to course_path(@course),
                  flash: { error: t('.already_registered_format') %
                    { role: current_course_user.role } }
      return
    end

    existing = Course::EnrolRequest.find_by_user_id_and_course_id(current_user.id, @course.id)
    if existing
      @enrol_request = existing
    end

    if CourseUser.roles.include?(params[:role])
      @enrol_request.role = params[:role]
    else
      @enrol_request.role = :student
    end

    @enrol_request.course = @course
    @enrol_request.user = current_user
    @enrol_request.save!
    # TODO: Notify lecturer
  end

  def approve #:nodoc:
    process_enrol_requests([@enrol_request.id], true)
  end

  def delete #:nodoc:
    process_enrol_requests([@enrol_request.id])
  end

  def should_process_all_requests? #:nodoc:
    params[:approve_all_staff] || params[:delete_all_staff] ||
      params[:approve_all_student] || params[:delete_all_student]
  end

  def should_approve? #:nodoc:
    params[:approve_all_student] || params[:approve_selected_student] ||
      params[:approve_all_staff] || params[:approve_selected_staff]
  end

  def all_enrol_requests #:nodoc:
    if params[:approve_all_student]
      @enrol_requests.student
    else
      @enrol_requests.staff
    end
  end

  def process_multiple #:nodoc:
    if should_process_all_requests?
      process_enrol_requests(all_enrol_requests, should_approve?)
    else
      process_enrol_requests(params[:enrol_request_ids], should_approve?)
    end
  end

  # Process the given list of enrol_requests and respond to the http request
  # @param enrol_request_ids [Array] An array of Course::EnrolRequest's IDs
  # @param approve [Boolean] True if the action is to approve the given requests. Default
  #        to false
  # @response [Hash] a hash of the process results. It has the following keys:
  #         status: "ok" if the operation is successful. "error" otherwise.
  #         message: The text message indicating success or failure of the operation.
  #         processed_ids: The IDs of processed enrol_requests
  #         error_id: The ID of the enrol_request where the error occurred. This key is present
  #                   only when the status is "error"
  def process_enrol_requests(enrol_request_ids, approve = false)
    authorize! :approve, Course::EnrolRequest

    enrol_request_ids ||= []
    enrol_requests = get_enrol_requests(enrol_request_ids)
    count = 0
    flash = {}
    begin
      enrol_requests.each do |enrol_request|
        @current_id = enrol_request.id
        if approve
          enrol_request.approve!
        end

        enrol_request.destroy!
        count += 1
      end

      if approve
        flash[:notice] = t('course.enrol_requests.approve_message_format') % { count: count }
      else
        flash[:notice] = t('course.enrol_requests.delete_message_format') % { count: count }
      end
    rescue
      flash[:error] = t('course.enrol_requests.error_message_format') % { reason: $ERROR_INFO }
    end

    respond_to do |format|
      format.html do
        redirect_to course_enrol_requests_path(@course), flash: flash
      end
    end
  end

  # Get a list of enrol_requests of the given IDs. If the record of an ID is not found,
  # it will not be included in the returned list.
  def get_enrol_requests(enrol_request_ids)
    enrol_request_ids.map { |enrol_request_id| Course::EnrolRequest.find_by_id(enrol_request_id) }.
      select { |enrol_request| enrol_request }
  end
end
