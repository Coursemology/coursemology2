class Course::EnrolRequestsController < Course::ModuleController
  load_and_authorize_resource through: :course

  def index #:nodoc:
    @staff_requests = @enrol_requests.staff
    @student_requests = @enrol_requests.student

    respond_to do |format|
      format.html
      format.json do
        def get_request_hash(requests)
          result = []
          requests.each do |request|
            request_hash = request.as_json(include: {user: {only: [:name, :email]}})
            request_hash[:path] = course_enroll_request_path(@course, request.id, 'json')
            result << request_hash
          end
          result
        end

        staff_request_hashes = get_request_hash(@staff_requests)
        student_request_hashes = get_request_hash(@student_requests)
        response_hash = {staff_requests: staff_request_hashes, student_requests: student_request_hashes}
        render json: response_hash
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

    existing = Course::EnrolRequest.find_by_user_id_and_course_id(current_user.id,
                                                                         @course.id)
    if !current_course_user && !existing
      if CourseUser.roles.include?(params[:role])
        @enrol_request.role = params[:role]
      else
        @enrol_request.role = :student
      end

      @enrol_request.course = @course
      @enrol_request.user = current_user
      @enrol_request.role = @role
      @enrol_request.save!
      # TODO notify lecturer
    end
  end

  def approve #:nodoc:
    process_enrol_requests([@enrol_request.id], true)
  end

  def approve_selected #:nodoc:
    process_enrol_requests(params[:enrol_request_ids], true)
  end

  def delete #:nodoc:
    process_enrol_requests([@enrol_request.id])
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
    enrol_request_ids ||= []
    enrol_requests = get_enrol_requests(enrol_request_ids)
    response_hash = {status: :ok, processed_ids: []}
    begin
      enrol_requests.each do |enrol_request|
        @current_id = enrol_request.id
        if approve
          approve_request!(enrol_request)
        end

        enrol_request.destroy!
        response_hash[:processed_ids] << @current_id
      end

      count = response_has[:processed_ids].count
      if approve
        response_hash[:message] = t('course.enrol_requests.approve_message_format') % count
      else
        response_hash[:message] = t('course.enrol_requests.delete_message_format') % count
      end
    rescue
      response_hash[:status] = :error
      response_hash[:error_id] = @current_id
      response_hash[:message] = t('course.enrol_requests.error_message_format') % $!.message
    end

    respond_to do |format|
      format.json do
        if response_hash[:status] == :ok
          status = :ok
        else
          status = :internal_server_error
        end
        render json: response_hash, status: status
      end
    end
  end

  # Get a list of enrol_requests of the given IDs. If the record of an ID is not found,
  # it will not be included in the returned list.
  def get_enrol_requests(enrol_request_ids)
    enrol_request_ids.map { |enrol_request_id|
      Course::EnrolRequest.find(enrol_request_id)
    }.select { |enrol_request| !!enrol_request }
  end

  # Approve the given enrol_request.
  def approve_request!(enrol_request)
    authorize! :approve, EnrollRequest

    if CourseUser.where(course_id: @course, user_id: enrol_request.user_id)
      return
    end

    @course.course_users.create!(user_id: enrol_request.user_id, role: enrol_request.role)
  end

end
