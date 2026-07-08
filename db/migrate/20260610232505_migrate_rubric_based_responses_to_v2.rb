# frozen_string_literal: true
require 'digest'

# One-shot migration moving RubricBasedResponse onto the v2 Course::Rubric stack. It runs in two parts:
#
# Part A -- rubric structure + active pointer:
#   1. +content_hash+ on course_rubrics    -- canonical fingerprint of a rubric's content tree.
#   2. +weight+ on course_rubric_categories -- explicit category sort key (enables future reordering).
#   3. +active_rubric_id+ on course_assessment_questions (the polymorphic question, for parity across
#        question types) -- points each v1 question at the Course::Rubric (v2) that mirrors its current rubric.
#   ...then backfills weights, content_hash, and active_rubric_id (find-or-create a v2 rubric per question).
#
# Part B -- grading evaluations:
#   4. +evaluation_type+ on course_rubric_answer_evaluations -- splits evaluations into:
#        * +playground+        (raw LLM output; auto-grade + playground; <=1 per (answer, rubric))
#        * +playground_hidden+ (a playground evaluation dismissed by the user; same data, hidden from fetch)
#        * +grading+           (the official grade-bearing breakdown; <=1 per answer; rubric_id is graded)
#   ...then backfills a +grading+ evaluation for every answer that has v1 rubric selections, mapping the v1
#   selection tree onto the question's v2 active_rubric (category by name, criterion by grade).
#
# IMPORTANT: this migration NEVER touches answer.grade. Part B only materialises the grade *breakdown* as a
# v2 grading evaluation; the stored total grade is preserved exactly.
#
# The hash computation here is intentionally SELF-CONTAINED (see #content_hash_for): it calls no application
# model method, so future refactors of the app-side hashing cannot change the values this migration wrote.
#
# NOTE: identical content does NOT collapse into one rubric (an intentional user revert may reproduce an
# earlier hash), so there is deliberately no unique index on (course_id, content_hash). Deduplication is
# best-effort and scoped to a single question's existing version history.
class MigrateRubricBasedResponsesToV2 < ActiveRecord::Migration[7.2] # rubocop:disable Metrics/ClassLength
  # Throwaway, dependency-free AR classes scoped to this migration. They deliberately do NOT inherit the
  # application models' validations, default scopes, or callbacks.
  class MigrationRubric < ActiveRecord::Base
    self.table_name = 'course_rubrics'
    self.record_timestamps = false # table has created_at but no updated_at
  end

  class MigrationRubricCategory < ActiveRecord::Base
    self.table_name = 'course_rubric_categories'
    self.record_timestamps = false
  end

  class MigrationRubricCriterion < ActiveRecord::Base
    self.table_name = 'course_rubric_category_criterions'
    self.record_timestamps = false
  end

  class MigrationQuestionRubric < ActiveRecord::Base
    self.table_name = 'course_assessment_question_rubrics'
    self.record_timestamps = false
  end

  class MigrationV1Question < ActiveRecord::Base
    self.table_name = 'course_assessment_question_rubric_based_responses'
    self.record_timestamps = false
  end

  class MigrationQuestion < ActiveRecord::Base
    self.table_name = 'course_assessment_questions'
    self.record_timestamps = false
  end

  class MigrationV1Category < ActiveRecord::Base
    self.table_name = 'course_assessment_question_rubric_based_response_categories'
    self.record_timestamps = false
  end

  class MigrationV1Criterion < ActiveRecord::Base
    self.table_name = 'course_assessment_question_rubric_based_response_criterions'
    self.record_timestamps = false
  end

  class MigrationAnswerEvaluation < ActiveRecord::Base
    self.table_name = 'course_rubric_answer_evaluations'
    self.record_timestamps = false
  end

  class MigrationEvalSelection < ActiveRecord::Base
    self.table_name = 'course_rubric_answer_evaluation_selections'
    self.record_timestamps = false
  end

  class MigrationV1Selection < ActiveRecord::Base
    self.table_name = 'course_assessment_answer_rubric_based_response_selections'
    self.record_timestamps = false
  end

  RBR_QUESTION_TYPE = 'Course::Assessment::Question::RubricBasedResponse'
  RBR_ANSWER_TYPE = 'Course::Assessment::Answer::RubricBasedResponse'
  PLAYGROUND = 'playground'
  PLAYGROUND_HIDDEN = 'playground_hidden'
  GRADING = 'grading'

  def up
    # --- Part A: rubric structure + active pointer ---
    add_column :course_rubrics, :content_hash, :string, null: false, default: ''
    add_column :course_rubric_categories, :weight, :integer, null: false, default: 0
    # active_rubric lives on the polymorphic question (not the RBR actable) so rubric grading can extend to
    # other question types; it is null for every non-RBR question. on_delete: :nullify so destroying an
    # (orphaned) rubric clears the pointer instead of tripping the FK while the question is being destroyed.
    add_reference :course_assessment_questions, :active_rubric,
                  null: true, index: true, foreign_key: { to_table: :course_rubrics, on_delete: :nullify }

    # The inner AR classes may have cached column info from the pre-migration schema; refresh it so the
    # newly added columns are visible to the backfills below.
    [MigrationRubric, MigrationRubricCategory, MigrationV1Question].each(&:reset_column_information)

    backfill_category_weights
    backfill_rubric_content_hashes
    backfill_active_rubrics

    # --- Part B: grading evaluations ---
    add_column :course_rubric_answer_evaluations, :evaluation_type, :string, null: false, default: PLAYGROUND
    # A grading evaluation may have a null rubric_id: graded by hand without AI prefill ("manually graded").
    # Playground kinds always carry a rubric (enforced in the model).
    change_column_null :course_rubric_answer_evaluations, :rubric_id, true
    add_index :course_rubric_answer_evaluations, :answer_id,
              unique: true, where: "evaluation_type = '#{GRADING}'",
              name: 'index_course_rubric_grading_evaluation_on_answer'
    # A playground evaluation and its dismissed (hidden) form are the same kind, so at most one of either
    # exists per (answer, rubric): dismissing flips the type, re-evaluating un-hides the same row.
    add_index :course_rubric_answer_evaluations, [:answer_id, :rubric_id],
              unique: true, where: "evaluation_type IN ('#{PLAYGROUND}', '#{PLAYGROUND_HIDDEN}')",
              name: 'index_course_rubric_playground_evaluation_on_answer_rubric'

    MigrationAnswerEvaluation.reset_column_information
    backfill_grading_evaluations
  end

  def down
    # Reverse Part B: delete the grading evaluations (and their selections) this migration created before
    # dropping the column that distinguishes them. Pre-existing (llm) evaluations are untouched.
    execute(<<~SQL.squish)
      DELETE FROM course_rubric_answer_evaluation_selections
      WHERE answer_evaluation_id IN (
        SELECT id FROM course_rubric_answer_evaluations WHERE evaluation_type = '#{GRADING}'
      )
    SQL
    execute("DELETE FROM course_rubric_answer_evaluations WHERE evaluation_type = '#{GRADING}'")
    # Only grading evaluations could carry a null rubric_id, and they have just been deleted, so the column
    # can be made NOT NULL again.
    change_column_null :course_rubric_answer_evaluations, :rubric_id, false
    remove_index :course_rubric_answer_evaluations, name: 'index_course_rubric_grading_evaluation_on_answer'
    remove_index :course_rubric_answer_evaluations, name: 'index_course_rubric_playground_evaluation_on_answer_rubric'
    remove_column :course_rubric_answer_evaluations, :evaluation_type

    # Reverse Part A. The v2 rubrics created during backfill are intentionally left in place -- there is no
    # reliable marker distinguishing them from playground-authored rubrics, and deleting them could orphan
    # evaluations. Only the schema additions are reversed.
    remove_reference :course_assessment_questions, :active_rubric,
                     foreign_key: { to_table: :course_rubrics }
    remove_column :course_rubric_categories, :weight
    remove_column :course_rubrics, :content_hash
  end

  private

  # Assigns sequential weights (0, 1, 2, ...) to each rubric's non-bonus categories, ordered by id so the
  # current on-screen ordering is preserved. Bonus categories keep the default weight of 0; they are
  # excluded from the content hash regardless.
  def backfill_category_weights
    MigrationRubricCategory.where(is_bonus_category: false).order(:rubric_id, :id).
      group_by(&:rubric_id).each_value do |categories|
        categories.each_with_index do |category, index|
          category.update_column(:weight, index)
        end
      end
  end

  def backfill_rubric_content_hashes
    MigrationRubric.find_each do |rubric|
      rubric.update_column(:content_hash, content_hash_for(v2_category_content(rubric.id)))
    end
  end

  def backfill_active_rubrics
    question_meta_by_actable = question_meta_by_actable_map
    course_id_by_question = question_id_to_course_id_map

    MigrationV1Question.find_each do |v1_question|
      meta = question_meta_by_actable[v1_question.id]
      next unless meta # orphaned actable with no polymorphic question row

      question_id = meta['question_id']
      categories = v1_category_content(v1_question.id)
      next if categories.empty? # nothing gradable to mirror; leave active_rubric_id nil

      hash = content_hash_for(categories)

      # The content_hash no longer encodes grading_prompt/model_answer, so a hash match only proves the
      # category/criterion structure matches. Reuse an existing linked rubric ONLY when its prompt and model
      # answer ALSO match this question's; otherwise synthesize a new rubric carrying the correct prompt/model.
      linked_rubric_ids = MigrationQuestionRubric.where(question_id: question_id).pluck(:rubric_id)
      match = MigrationRubric.where(id: linked_rubric_ids, content_hash: hash).order(id: :desc).
              find { |candidate| rubric_metadata_matches?(candidate, v1_question) }

      if match
        MigrationQuestion.where(id: question_id).update_all(active_rubric_id: match.id)
        next
      end

      course_id = course_id_by_question[question_id] ||
                  MigrationRubric.where(id: linked_rubric_ids).limit(1).pick(:course_id)
      next unless course_id # cannot determine the owning course; cannot create a rubric

      rubric = create_v2_rubric!(rubric_attributes(course_id, meta['updated_at'], v1_question, hash), categories)
      MigrationQuestionRubric.create!(question_id: question_id, rubric_id: rubric.id)
      MigrationQuestion.where(id: question_id).update_all(active_rubric_id: rubric.id)
    end
  end

  # Creates one +grading+ evaluation per answer that has v1 rubric selections, pinned to the question's
  # active_rubric, mapping each v1 selection onto the v2 rubric (category by name, criterion by grade).
  def backfill_grading_evaluations
    MigrationV1Selection.order(:answer_id).group_by(&:answer_id).each do |actable_id, selections|
      meta = answer_meta_lookup[actable_id]
      next unless meta # answer row missing (shouldn't happen)

      active_rubric_id = active_rubric_lookup[meta[:question_id]]
      next unless active_rubric_id # question has no active rubric (e.g. unattached); nothing to pin to

      evaluation = MigrationAnswerEvaluation.create!(
        answer_id: meta[:answer_id], rubric_id: active_rubric_id, evaluation_type: GRADING
      )

      rows = selections.filter_map { |selection| grading_selection_row(selection, evaluation.id, active_rubric_id) }
      MigrationEvalSelection.insert_all(rows) if rows.any?
    end
  end

  # A synthesized/linked rubric may be reused for a question only when its prompt and model answer match
  # (the content_hash no longer covers them -- see #content_hash_for).
  def rubric_metadata_matches?(rubric, v1_question)
    rubric.grading_prompt.to_s == v1_question.ai_grading_custom_prompt.to_s &&
      rubric.model_answer.to_s == v1_question.ai_grading_model_answer.to_s
  end

  # Maps a single v1 selection onto a v2 grading selection row, or nil when it should be skipped (bonus
  # category, or a category with no name-match in the active rubric). Criterion is matched by grade; an
  # ungraded (null) v1 selection stays null.
  def grading_selection_row(selection, evaluation_id, active_rubric_id)
    v1_category = v1_category_lookup[selection.category_id]
    return if v1_category.nil? || v1_category[:bonus]

    v2_category_id = v2_category_lookup.dig(active_rubric_id, v1_category[:name])
    return unless v2_category_id

    grade = selection.criterion_id ? v1_criterion_grade_lookup[selection.criterion_id] : selection.grade
    criterion_id = grade.nil? ? nil : v2_criterion_lookup.dig(v2_category_id, grade)

    { answer_evaluation_id: evaluation_id, category_id: v2_category_id, criterion_id: criterion_id }
  end

  def answer_meta_lookup
    @answer_meta_lookup ||= rbr_answer_meta_by_actable
  end

  def active_rubric_lookup
    @active_rubric_lookup ||= active_rubric_id_by_question
  end

  def v1_category_lookup
    @v1_category_lookup ||= v1_category_by_id
  end

  def v1_criterion_grade_lookup
    @v1_criterion_grade_lookup ||= v1_criterion_grade_by_id
  end

  def v2_category_lookup
    @v2_category_lookup ||= v2_category_id_by_rubric_and_name
  end

  def v2_criterion_lookup
    @v2_criterion_lookup ||= v2_criterion_id_by_category_and_grade
  end

  # The rubric's created_at is seeded from the parent question's updated_at, so a synthesized v2 rubric
  # carries the moment the question (and thus its rubric) was last edited, rather than the migration run.
  def rubric_attributes(course_id, created_at, v1_question, hash)
    {
      course_id: course_id,
      created_at: created_at,
      grading_prompt: v1_question.ai_grading_custom_prompt.to_s,
      model_answer: v1_question.ai_grading_model_answer.to_s,
      content_hash: hash
    }
  end

  # Non-bonus category content for an existing v2 rubric, carrying the backfilled +weight+ column.
  def v2_category_content(rubric_id)
    MigrationRubricCategory.where(rubric_id: rubric_id, is_bonus_category: false).map do |category|
      category_entry(category.name, category.weight, criterions_for(MigrationRubricCriterion, category.id))
    end
  end

  # Non-bonus category content for a v1 question. The v1 schema has no weight column, so weight is
  # synthesized from the question UI order -- RubricBasedResponseCategory's default scope presents non-bonus
  # categories by name ascending -- so the displayed order carries into the v2 weights.
  def v1_category_content(question_id)
    MigrationV1Category.where(question_id: question_id, is_bonus_category: false).
      sort_by { |category| category.name.to_s }.each_with_index.map do |category, index|
        category_entry(category.name, index, criterions_for(MigrationV1Criterion, category.id))
      end
  end

  def category_entry(name, weight, criterions)
    { name: name, weight: weight, criterions: criterions }
  end

  def criterions_for(criterion_class, category_id)
    criterion_class.where(category_id: category_id).map do |criterion|
      { grade: criterion.grade, explanation: criterion.explanation }
    end
  end

  # SELF-CONTAINED canonical hash, kept structurally parallel to the application-side
  # Course::Rubric#canonical_content. The fingerprint is formed ONLY from category/criterion data and is
  # ORDER-INDEPENDENT: categories are sorted by name and criterions by grade, so two revisions hash equal
  # iff they have the same categories/criterions regardless of display order. grading_prompt/model_answer
  # are deliberately EXCLUDED -- the hash answers "are these two rubrics structurally (in)compatible for
  # carrying grades forward?", not "is anything different?". Bonus categories never exist in the v2 world
  # (and are excluded upstream from v1 too). Must stay stable across application refactors.
  def content_hash_for(categories)
    ordered = categories.sort_by { |category| category[:name].to_s }
    Digest::SHA256.hexdigest(ordered.map { |category| canonical_category(category) }.to_json)
  end

  def canonical_category(category)
    ordered = category[:criterions].sort_by { |criterion| criterion[:grade].to_i }
    {
      name: category[:name].to_s,
      criterions: ordered.map do |criterion|
        { grade: criterion[:grade].to_i, explanation: criterion[:explanation].to_s }
      end
    }
  end

  def create_v2_rubric!(attributes, categories)
    rubric = MigrationRubric.create!(attributes)
    # Persist the synthesized weight from the category content so the stored weight matches the value used to
    # compute the rubric's content_hash above.
    categories.sort_by { |category| category[:weight].to_i }.each do |category|
      new_category = MigrationRubricCategory.create!(
        rubric_id: rubric.id, name: category[:name], is_bonus_category: false, weight: category[:weight]
      )
      category[:criterions].each do |criterion|
        MigrationRubricCriterion.create!(
          category_id: new_category.id, grade: criterion[:grade], explanation: criterion[:explanation].to_s
        )
      end
    end
    rubric
  end

  # actable_id (course_assessment_question_rubric_based_responses.id) => the polymorphic question row (its id,
  # plus updated_at which becomes the created_at of any rubric synthesized for the question).
  def question_meta_by_actable_map
    rows = select_all(<<~SQL.squish)
      SELECT id AS question_id, actable_id AS actable_id, updated_at AS updated_at
      FROM course_assessment_questions
      WHERE actable_type = #{quote(RBR_QUESTION_TYPE)}
    SQL
    rows.to_h { |row| [row['actable_id'], row] }
  end

  # polymorphic question id => course_id, traversed via the assessment -> tab -> category chain. A question
  # may belong to several assessments; they share a course, so the first hit is taken.
  def question_id_to_course_id_map
    rows = select_all(<<~SQL.squish)
      SELECT q.id AS question_id, cat.course_id AS course_id
      FROM course_assessment_questions q
      JOIN course_question_assessments cqa ON cqa.question_id = q.id
      JOIN course_assessments a ON a.id = cqa.assessment_id
      JOIN course_assessment_tabs tab ON tab.id = a.tab_id
      JOIN course_assessment_categories cat ON cat.id = tab.category_id
      WHERE q.actable_type = #{quote(RBR_QUESTION_TYPE)}
    SQL
    rows.each_with_object({}) { |row, map| map[row['question_id']] ||= row['course_id'] }
  end

  # v1 RBR answer actable id => { answer_id: polymorphic answer id, question_id: }
  def rbr_answer_meta_by_actable
    select_all(<<~SQL.squish).each_with_object({}) do |row, map| # rubocop:disable Style/ReduceToHash
      SELECT id AS answer_id, actable_id, question_id
      FROM course_assessment_answers
      WHERE actable_type = #{quote(RBR_ANSWER_TYPE)}
    SQL
      map[row['actable_id']] = { answer_id: row['answer_id'], question_id: row['question_id'] }
    end
  end

  # polymorphic question id => the question's v2 active_rubric_id (set by backfill_active_rubrics above).
  def active_rubric_id_by_question
    select_all(<<~SQL.squish).to_h { |row| [row['question_id'], row['active_rubric_id']] }
      SELECT id AS question_id, active_rubric_id
      FROM course_assessment_questions
      WHERE actable_type = #{quote(RBR_QUESTION_TYPE)}
    SQL
  end

  def v1_category_by_id
    sql = 'SELECT id, name, is_bonus_category FROM course_assessment_question_rubric_based_response_categories'
    select_all(sql).each_with_object({}) do |row, map| # rubocop:disable Style/ReduceToHash
      map[row['id']] = { name: row['name'], bonus: row['is_bonus_category'] }
    end
  end

  def v1_criterion_grade_by_id
    select_all('SELECT id, grade FROM course_assessment_question_rubric_based_response_criterions').
      to_h { |row| [row['id'], row['grade']] }
  end

  # { rubric_id => { category_name => v2 category id } }
  def v2_category_id_by_rubric_and_name
    select_all('SELECT id, rubric_id, name FROM course_rubric_categories').each_with_object({}) do |row, map|
      (map[row['rubric_id']] ||= {})[row['name']] = row['id']
    end
  end

  # { category_id => { grade => v2 criterion id } }
  def v2_criterion_id_by_category_and_grade
    sql = 'SELECT id, category_id, grade FROM course_rubric_category_criterions'
    select_all(sql).each_with_object({}) do |row, map|
      (map[row['category_id']] ||= {})[row['grade']] = row['id']
    end
  end
end
