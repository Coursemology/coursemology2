# frozen_string_literal: true
class Course::ProgrammingUpgrade::QuestionsController < Course::ProgrammingUpgrade::Controller
  include Course::Statistics::CountsConcern

  def index
    @row_count = question_scope.distinct.count(:id)
    @questions = paged_questions
    refresh_upgrades(@questions)
    @submission_counts_hash = submission_counts_hash(@questions)
    @languages = Coursemology::Polyglot::Language.all.to_a
    @upgrade_targets_hash = Coursemology::Polyglot::Language.upgrade_targets_by_language_id
  end

  # Starts an upgrade for one or more questions. Accepts a target language per question so a bulk
  # selection spanning several language families can be upgraded in one request.
  def create
    questions = upgradable_questions.where(id: upgrade_params.keys)
    targets = questions.to_h { |question| [question, languages_by_id[upgrade_params[question.id.to_s]]] }

    @upgrades, @rejected = upgrade_service.upgrade(targets)
    render 'upgrades', status: @upgrades.empty? ? :unprocessable_entity : :accepted
  end

  # Moves a question back to the language its last upgrade started from.
  def revert
    question = upgradable_questions.find(params[:id])
    upgrade = question.upgrade

    head :not_found and return if upgrade.nil?

    @upgrades, @rejected = upgrade_service.revert(upgrade)
    render 'upgrades', status: @upgrades.empty? ? :unprocessable_entity : :accepted
  end

  # Poller for rows the client is watching. Only in-progress rows are worth re-reading, so the client
  # sends just those ids.
  def fetch_upgrades
    @questions = upgradable_questions.where(id: params[:question_ids])
    refresh_upgrades(@questions)
    render 'upgrades', locals: { upgrades: @questions.filter_map(&:upgrade) }
  end

  private

  def upgrade_service
    Course::Assessment::Question::ProgrammingUpgradeService.new(current_course, current_user)
  end

  # Every programming question in the course. Kept free of preloads so it can also be counted.
  def question_scope
    Course::Assessment::Question::Programming.
      joins(question: { question_assessments: :assessment }).
      where(course_assessments: { id: current_course.assessments.select(:id) })
  end

  # The same set with everything the table and the pre-validation in +ProgrammingUpgradeService+
  # need. Without the association preloads, validating a bulk selection is N+1: +before_validation+
  # touches template files and test cases on each question.
  def upgradable_questions
    question_scope.includes(:language, :template_files, :test_cases, :upgrades,
                            question: { question_assessments: :assessment })
  end

  def paged_questions
    upgradable_questions.
      order('course_assessments.id, course_question_assessments.weight').
      paginated(page_param)
  end

  # Brings each question's upgrade row in line with its import job before rendering, so a lost job
  # cannot pin a row in a running state forever.
  def refresh_upgrades(questions)
    questions.each { |question| question.upgrade&.refresh! }
  end

  # Assessment-level submission counts. Deliberately not per question: counting answers would mean a
  # far heavier query for a number that only drives a warning prompt.
  def submission_counts_hash(questions)
    assessment_ids = questions.flat_map { |q| q.question.question_assessments.map(&:assessment_id) }.uniq
    return {} if assessment_ids.empty?

    Course::Assessment::Submission.
      where(assessment_id: assessment_ids).
      where.not(workflow_state: :attempting).
      group(:assessment_id).count
  end

  def languages_by_id
    @languages_by_id ||= Coursemology::Polyglot::Language.
                         where(id: upgrade_params.values).index_by { |l| l.id.to_s }
  end

  # @return [Hash{String => String}] question id => target language id.
  def upgrade_params
    @upgrade_params ||= params.require(:upgrades).permit!.to_h
  end
end
