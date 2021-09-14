# frozen_string_literal: true
class Course::Assessment::QuestionBundleAssignmentsController < Course::Assessment::Controller
  include Course::Assessment::QuestionBundleAssignmentConcern
  load_and_authorize_resource :question_bundle_assignment, class: Course::Assessment::QuestionBundleAssignment,
                                                           through: :assessment

  before_action :add_breadcrumbs

  def index
    @question_group_lookup = @assessment.question_groups.select(:id, :title).map { |qg| [qg.id, qg.title] }.to_h
    @question_bundle_lookup = @assessment.question_bundles.select(:id, :title).map { |qb| [qb.id, qb.title] }.to_h
    @past_assignments = past_assignments_hash
    @assignment_randomizer = AssignmentRandomizer.new(@assessment)
    @assignment_set = @assignment_randomizer.load
    @name_lookup = @assignment_randomizer.name_lookup
    @validation_results = @assignment_randomizer.validate(@assignment_set)
    @aggregated_offending_cells = {} # { [student_id, group_id]: [ error_string ] }
    @validation_results.each_value do |result|
      next if result.offending_cells.nil?

      result.offending_cells.each do |cell, error_string|
        @aggregated_offending_cells[cell] ||= []
        @aggregated_offending_cells[cell] << error_string
      end
    end
  end

  def create
    assignment_set_params = params.require(:assignment_set).permit([:user_id, bundles: {}])
    user = User.find(assignment_set_params[:user_id])
    bundles = Course::Assessment::QuestionBundle.where(id: assignment_set_params[:bundles].values).
              joins(:question_group).merge(Course::Assessment::QuestionGroup.where(assessment: @assessment))

    user.transaction do
      @assessment.question_bundle_assignments.where(submission: nil, user: user).delete_all
      bundles.each do |bundle|
        Course::Assessment::QuestionBundleAssignment.create!(
          user: user,
          assessment: @assessment,
          question_bundle: bundle
        )
      end
    end

    redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
  end

  def edit
  end

  def update
    if @question_bundle_assignment.update(question_bundle_assignment_params)
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
    else
      render 'edit'
    end
  end

  def destroy
    if @question_bundle_assignment.destroy
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
    else
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment),
                  danger: @question_bundle_assignment.errors.full_messages.to_sentence
    end
  end

  def recompute
    @assignment_randomizer = AssignmentRandomizer.new(@assessment)
    @assignment_set = @assignment_randomizer.randomize
    if params[:only_unassigned] == 'true'
      current_set = @assignment_randomizer.load
      @assessment.question_bundle_assignments.distinct.pluck(:user_id).each do |assigned_user_id|
        @assignment_set.assignments[assigned_user_id] = current_set.assignments[assigned_user_id]
      end
    end
    @assignment_randomizer.save(@assignment_set)
    redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
  end

  private

  def past_assignments_hash
    @group_bundles_lookup = @assessment.question_bundles.map { |bundle| [bundle.id, bundle.group_id] }.to_h
    @assessment.submissions.eager_load(:question_bundle_assignments).map do |submission|
      hash = { submission_id: submission.id, nil => [] }
      submission.question_bundle_assignments.each do |qba|
        group = @group_bundles_lookup[qba.bundle_id]
        hash[group].nil? ? hash[group] = qba.bundle_id : hash[nil].append(qba.bundle_id)
      end
      [submission.creator_id, hash]
    end.to_h
  end

  def add_breadcrumbs
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
    add_breadcrumb('Question Bundle Assignment',
                   course_assessment_question_bundle_assignments_path(current_course, @assessment))
  end
end
