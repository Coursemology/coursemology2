class Course::EnrolRequestsController < Course::ModuleController
  load_and_authorize_resource through: :course
  skip_before_filter :verify_authenticity_token, only: [:approve_selected, :delete_selected]

  def index #:nodoc:
    @staff_requests = @enrol_requests.staff
    @student_requests = @enrol_requests.student

    respond_to do |format|
      format.html
      format.json do
        render json: {staff_requests: @staff_requests, student_requests: @student_requests}
      end
    end
  end

  def new #:nodoc:
    unless current_user
      redirect_to new_user_session_path
      return
    end
    unless @course.opened?
      redirect_to course_path(@course)
      return
    end

    existing = Course::EnrolRequest.with_deleted.find_by_user_id_and_course_id(current_user.id,
                                                                               @course.id)
    if existing
      if existing.deleted?
        Course::EnrolRequest.restore(existing)
      end

      @enrol_request = existing
    end

    if !current_course_user
      if CourseUser.roles.include?(params[:role])
        @enrol_request.role = params[:role]
      else
        @enrol_request.role = :student
      end

      @enrol_request.course = @course
      @enrol_request.user = current_user
      @enrol_request.save!
      # TODO notify lecturer
    end
  end

  def approve_selected #:nodoc:
    process_enrol_requests(params[:enrol_request_ids], true)
  end

  def delete_selected #:nodoc:
    process_enrol_requests(params[:enrol_request_ids])
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
    response_hash = {status: :ok, processed_ids: []}
    begin
      enrol_requests.each do |enrol_request|
        @current_id = enrol_request.id
        if approve
          enrol_request.approve!
        end

        enrol_request.destroy!
        response_hash[:processed_ids] << @current_id
      end

      count = response_hash[:processed_ids].count
      if approve
        response_hash[:message] = t('course.enrol_requests.approve_message_format') % {count: count}
      else
        response_hash[:message] = t('course.enrol_requests.delete_message_format') % {count: count}
      end
    rescue
      response_hash[:status] = :error
      response_hash[:error_id] = @current_id
      response_hash[:message] = t('course.enrol_requests.error_message_format') %
        {reason: $!.message}
    end

    respond_to do |format|
      format.json do
        if response_hash[:status] == :ok
          status = :ok
        else
          status = :bad_request
        end
        render json: response_hash, status: status
      end
    end
  end

  # Get a list of enrol_requests of the given IDs. If the record of an ID is not found,
  # it will not be included in the returned list.
  def get_enrol_requests(enrol_request_ids)
    enrol_request_ids.map { |enrol_request_id|
      Course::EnrolRequest.find_by_id(enrol_request_id)
    }.select { |enrol_request| !!enrol_request }
  end
end
