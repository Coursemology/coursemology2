# frozen_string_literal: true
class Course::ProgrammingUpgrade::QuestionsController < Course::ProgrammingUpgrade::Controller
  include Course::Statistics::CountsConcern

  def index
    @row_count = question_scope.distinct.count(:id)
    @questions = paged_questions
    refresh_upgrades(@questions)
    @submission_counts_hash = submission_counts_hash(@questions)
    @languages = all_languages
    @upgrade_targets_hash = upgrade_targets_hash
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

  # The language table is a couple of dozen rows and is needed by the ordering, the payload and the
  # target resolution alike, so it is read once per request.
  def all_languages
    @all_languages ||= Coursemology::Polyglot::Language.all.to_a
  end

  def upgrade_targets_hash
    @upgrade_targets_hash ||=
      Coursemology::Polyglot::Language.upgrade_targets_by_language_id(all_languages)
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
      joins(:language).
      joins(authoritative_upgrade_join).
      order(Arel.sql("#{status_rank_sql}, #{language_rank_sql}, " \
                     'course_assessments.id, course_question_assessments.weight')).
      paginated(page_param)
  end

  # Joins each question to the upgrade row describing its *current* package, matching
  # +ProgrammingUpgrade.authoritative+. Neither join can fan out: +has_one_attachment+ caps a question
  # at one reference, and upgrades are unique per (question, attachment).
  def authoritative_upgrade_join
    <<~SQL.squish
      LEFT JOIN attachment_references
        ON attachment_references.attachable_id = course_assessment_question_programming.id
       AND attachment_references.attachable_type = 'Course::Assessment::Question::Programming'
      LEFT JOIN course_assessment_question_programming_upgrades
        ON course_assessment_question_programming_upgrades.question_id =
           course_assessment_question_programming.id
       AND course_assessment_question_programming_upgrades.attachment_id
           IS NOT DISTINCT FROM attachment_references.attachment_id
    SQL
  end

  # Surfaces the rows needing attention first: Import Failed, Pending, Deprecated, Upgradable, Ok,
  # then rows with no chip at all.
  #
  # The WHEN order mirrors the chip's own precedence rather than the rank values — an upgrade row's
  # state wins over the language-derived state, so a completed upgrade on a deprecated language reads
  # (and sorts) as Ok, not Deprecated.
  def status_rank_sql
    upgrades = 'course_assessment_question_programming_upgrades.workflow_state'
    latest_ids = upgrade_targets_hash.values.filter_map { |targets| targets.first&.id }.uniq

    # A language absent from latest_ids is not the newest in its family, i.e. upgradable. Fully
    # deprecated families have no latest, but their members are caught by the enabled check above.
    upgradable = latest_ids.empty? ? 'TRUE' : "polyglot_languages.id NOT IN (#{latest_ids.join(',')})"

    <<~SQL.squish
      CASE
        WHEN #{upgrades} = 'failed' THEN 0
        WHEN #{upgrades} IN ('pending', 'running', 'reverting') THEN 1
        WHEN #{upgrades} = 'completed' THEN 4
        WHEN NOT polyglot_languages.enabled THEN 2
        WHEN #{upgradable} THEN 3
        ELSE 5
      END
    SQL
  end

  # Language name ascending, then oldest version first. Built in Ruby because the ordering is by
  # numeric version rather than the string in `name` ('Python 3.9' sorts after 'Python 3.10'), and
  # neither `weight` nor `parent_id` records it (see the language model).
  def language_rank_sql
    whens = all_languages.
            sort_by { |language| [language.polyglot_name, language.comparable_polyglot_version] }.
            each_with_index.map { |language, rank| "WHEN #{language.id} THEN #{rank}" }
    return '0' if whens.empty?

    "CASE course_assessment_question_programming.language_id #{whens.join(' ')} ELSE #{whens.size} END"
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
