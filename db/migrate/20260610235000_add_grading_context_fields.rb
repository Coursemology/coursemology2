# frozen_string_literal: true
#   Part A -- +grading_mode+ on the polymorphic question: decouples "is this question rubric-graded?" from the
#             question's actable type ('default' = the type's own grading; 'rubric' = graded against
#             active_rubric). String-backed enum so future modes need no schema change. Editable only on
#             forum-post questions; RBR is backfilled (and locked) to 'rubric', every other type stays 'default'.
#   Part B -- +course_assessment_question_grading_contexts+: links a consumer question to context sources that
#             feed extra material into its rubric grading prompt (e.g. a sibling question's answer, or selected
#             forum-thread posts). +source+ is the (optional) polymorphic source entity; intrinsic providers
#             (a forum thread lives on the consumer's own answer) leave it null and describe themselves in
#             +options+. +identifier+ is the token the grader references in the rubric.
#   Part C -- +ai_grading_enabled+ on forum-post questions: toggles AI auto-grading while the question is
#             rubric-graded (RBR carries its own equivalent column). The grading prompt/model answer live on
#             the v2 rubric, so only the on/off flag lives here.
#   Part D -- +course_assessment_question_mock_answer_grading_contexts+: mock ("custom") answers in the rubric
#             playground have no submission, so their grading context can't be resolved from real answers --
#             the author supplies it. Each row links a mock answer to one of its question's grading contexts
#             and stores the author-typed +content+, injected into the mock evaluation labelled by that
#             context's identifier.
class AddGradingContextFields < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_questions, :grading_mode, :string, null: false, default: 'default'
    add_column :course_assessment_question_forum_post_responses, :ai_grading_enabled, :boolean,
               null: false, default: true

    reversible do |dir|
      dir.up do
        # Rubric-based response questions are, by definition, rubric-graded.
        execute(<<~SQL.squish)
          UPDATE course_assessment_questions
          SET grading_mode = 'rubric'
          WHERE actable_type = 'Course::Assessment::Question::RubricBasedResponse'
        SQL
      end
    end

    create_table :course_assessment_question_grading_contexts do |t|
      t.references :question, null: false, index: true,
                              foreign_key: { to_table: :course_assessment_questions, on_delete: :cascade }
      # The provider kind (e.g. 'sibling_question_answer', 'forum_thread'). Selects which provider turns this
      # context into prompt text; also decides what +source+ means (a sibling question, or intrinsic/self).
      t.string :context_type, null: false
      # The context source entity (e.g. a sibling Course::Assessment::Question). A plain polymorphic reference
      # with a distinct name (not the acts_as +actable+): one source can feed many consumers. Null for
      # intrinsic providers (the forum thread lives on the consumer's own answer), which are described by
      # +options+. Indexed so re-grading can find every consumer depending on a given source.
      t.references :source, polymorphic: true, null: true, index: true
      # The token the grader references in the rubric to point at this context (e.g. "reply to {parent_post}").
      t.string :identifier, null: false
      t.jsonb :options, null: false, default: {}
      t.timestamps

      # A context's identifier must be unambiguous within its consumer question.
      t.index [:question_id, :identifier], unique: true,
                                           name: 'index_grading_contexts_on_question_and_identifier'
    end

    create_table :course_assessment_question_mock_answer_grading_contexts do |t|
      t.references :mock_answer, null: false, index: true,
                                 foreign_key: { to_table: :course_assessment_question_mock_answers,
                                                on_delete: :cascade }
      t.references :grading_context, null: false, index: true,
                                     foreign_key: { to_table: :course_assessment_question_grading_contexts,
                                                    on_delete: :cascade }
      # The author-typed content for this context, injected into the mock answer's evaluation.
      t.text :content, null: false, default: ''
      t.timestamps

      # A mock answer has at most one content per grading context.
      t.index [:mock_answer_id, :grading_context_id], unique: true,
                                                      name: 'index_mock_answer_grading_contexts_on_mock_and_context'
    end
  end
end
