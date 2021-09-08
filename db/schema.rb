# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_08_21_030941) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "activities", force: :cascade do |t|
    t.integer "actor_id", null: false
    t.integer "object_id", null: false
    t.string "object_type", limit: 255, null: false
    t.string "event", limit: 255, null: false
    t.string "notifier_type", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actor_id"], name: "fk__activities_actor_id"
  end

  create_table "attachment_references", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.integer "attachable_id"
    t.string "attachable_type", limit: 255
    t.integer "attachment_id", null: false
    t.string "name", limit: 255, null: false
    t.datetime "expires_at"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "attachments", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.text "file_upload", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_attachments_on_name", unique: true
  end

  create_table "course_achievements", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.text "badge"
    t.integer "weight", null: false
    t.boolean "published", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_achievements_course_id"
    t.index ["creator_id"], name: "fk__course_achievements_creator_id"
    t.index ["updater_id"], name: "fk__course_achievements_updater_id"
  end

  create_table "course_announcements", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "content"
    t.boolean "sticky", default: false, null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.float "opening_reminder_token"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_announcements_course_id"
    t.index ["creator_id"], name: "fk__course_announcements_creator_id"
    t.index ["updater_id"], name: "fk__course_announcements_updater_id"
  end

  create_table "course_assessment_answer_auto_gradings", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "answer_id", null: false
    t.uuid "job_id"
    t.json "result"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_id", "actable_type"], name: "index_course_assessment_answer_auto_gradings_on_actable", unique: true
    t.index ["answer_id"], name: "index_course_assessment_answer_auto_gradings_on_answer_id", unique: true
    t.index ["job_id"], name: "index_course_assessment_answer_auto_gradings_on_job_id", unique: true
  end

  create_table "course_assessment_answer_multiple_response_options", force: :cascade do |t|
    t.integer "answer_id", null: false
    t.integer "option_id", null: false
    t.index ["answer_id", "option_id"], name: "index_multiple_response_answer_on_answer_id_and_option_id", unique: true
    t.index ["answer_id"], name: "fk__course_assessment_multiple_response_option_answer"
    t.index ["option_id"], name: "fk__course_assessment_multiple_response_option_question_option"
  end

  create_table "course_assessment_answer_multiple_responses", force: :cascade do |t|
    t.decimal "random_seed"
  end

  create_table "course_assessment_answer_programming", force: :cascade do |t|
  end

  create_table "course_assessment_answer_programming_auto_gradings", force: :cascade do |t|
    t.text "stdout"
    t.text "stderr"
    t.integer "exit_code"
  end

  create_table "course_assessment_answer_programming_file_annotations", force: :cascade do |t|
    t.integer "file_id", null: false
    t.integer "line", null: false
    t.index ["file_id"], name: "fk__course_assessment_answe_09c4b638af92d0f8252d7cdef59bd6f3"
  end

  create_table "course_assessment_answer_programming_files", force: :cascade do |t|
    t.integer "answer_id", null: false
    t.string "filename", limit: 255, null: false
    t.text "content", default: "", null: false
    t.index "answer_id, lower((filename)::text)", name: "index_course_assessment_answer_programming_files_filename", unique: true
    t.index ["answer_id"], name: "fk__course_assessment_answer_programming_files_answer_id"
  end

  create_table "course_assessment_answer_programming_test_results", force: :cascade do |t|
    t.integer "auto_grading_id", null: false
    t.integer "test_case_id"
    t.boolean "passed", null: false
    t.jsonb "messages", default: {}, null: false
    t.index ["auto_grading_id"], name: "fk__course_assessment_answe_3d4bf9a99ed787551e4454c7106971fc"
    t.index ["test_case_id"], name: "fk__course_assessment_answe_ca0d5ba368869806d2a9cb8717feed4f"
  end

  create_table "course_assessment_answer_scribing_scribbles", force: :cascade do |t|
    t.text "content"
    t.integer "answer_id", null: false
    t.integer "creator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["answer_id"], name: "fk__course_assessment_answer_scribing_scribbles_scribing_answer"
    t.index ["creator_id"], name: "fk__course_assessment_answer_scribing_scribbles_creator_id"
  end

  create_table "course_assessment_answer_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_answer_text_responses", force: :cascade do |t|
    t.text "answer_text"
  end

  create_table "course_assessment_answer_voice_responses", force: :cascade do |t|
  end

  create_table "course_assessment_answers", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "submission_id", null: false
    t.integer "question_id", null: false
    t.boolean "current_answer", default: false, null: false
    t.string "workflow_state", limit: 255, null: false
    t.datetime "submitted_at"
    t.decimal "grade", precision: 4, scale: 1
    t.boolean "correct", comment: "Correctness is independent of the grade (depends on the grading schema)"
    t.integer "grader_id"
    t.datetime "graded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_type", "actable_id"], name: "index_course_assessment_answers_actable", unique: true
    t.index ["grader_id"], name: "fk__course_assessment_answers_grader_id"
    t.index ["question_id"], name: "fk__course_assessment_answers_question_id"
    t.index ["submission_id"], name: "fk__course_assessment_answers_submission_id"
  end

  create_table "course_assessment_categories", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_assessment_categories_course_id"
    t.index ["creator_id"], name: "fk__course_assessment_categories_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_categories_updater_id"
  end

  create_table "course_assessment_question_bundle_assignments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "assessment_id", null: false
    t.bigint "submission_id"
    t.bigint "bundle_id", null: false
    t.index ["assessment_id"], name: "idx_course_assessment_question_bundle_assignments_on_assmt_id"
    t.index ["bundle_id"], name: "idx_course_assessment_question_bundle_assignments_on_bundle_id"
    t.index ["submission_id"], name: "idx_course_assessment_question_bundle_assignments_on_sub_id"
    t.index ["user_id"], name: "index_course_assessment_question_bundle_assignments_on_user_id"
  end

  create_table "course_assessment_question_bundle_questions", force: :cascade do |t|
    t.bigint "bundle_id", null: false
    t.bigint "question_id", null: false
    t.integer "weight", null: false
    t.index ["bundle_id", "question_id"], name: "idx_course_assessment_question_bundle_questions_on_b_and_q_id", unique: true
    t.index ["bundle_id"], name: "index_course_assessment_question_bundle_questions_on_bundle_id"
    t.index ["question_id"], name: "idx_course_assessment_question_bundle_questions_on_q_id"
  end

  create_table "course_assessment_question_bundles", force: :cascade do |t|
    t.string "title", null: false
    t.bigint "group_id", null: false
    t.index ["group_id"], name: "index_course_assessment_question_bundles_on_group_id"
  end

  create_table "course_assessment_question_groups", force: :cascade do |t|
    t.string "title", null: false
    t.bigint "assessment_id", null: false
    t.integer "weight", null: false
    t.index ["assessment_id"], name: "index_course_assessment_question_groups_on_assessment_id"
  end

  create_table "course_assessment_question_multiple_response_options", force: :cascade do |t|
    t.integer "question_id", null: false
    t.boolean "correct", null: false
    t.text "option", null: false
    t.text "explanation"
    t.integer "weight", null: false
    t.boolean "ignore_randomization", default: false
    t.index ["question_id"], name: "fk__course_assessment_multiple_response_option_question"
  end

  create_table "course_assessment_question_multiple_responses", force: :cascade do |t|
    t.integer "grading_scheme", default: 0, null: false
    t.boolean "randomize_options", default: false
  end

  create_table "course_assessment_question_programming", force: :cascade do |t|
    t.integer "language_id", null: false
    t.integer "memory_limit", comment: "Memory limit, in MiB"
    t.integer "time_limit", comment: "Time limit, in seconds"
    t.integer "attempt_limit"
    t.uuid "import_job_id", comment: "The ID of the importing job"
    t.integer "package_type", default: 0, null: false
    t.boolean "multiple_file_submission", default: false, null: false
    t.index ["import_job_id"], name: "index_course_assessment_question_programming_on_import_job_id", unique: true
    t.index ["language_id"], name: "fk__course_assessment_question_programming_language_id"
  end

  create_table "course_assessment_question_programming_template_files", force: :cascade do |t|
    t.integer "question_id", null: false
    t.string "filename", limit: 255, null: false
    t.text "content", null: false
    t.index "question_id, lower((filename)::text)", name: "index_course_assessment_question_programming_template_filenames", unique: true
    t.index ["question_id"], name: "fk__course_assessment_quest_dbf3aed51f19fcc63a25d296a057dd1f"
  end

  create_table "course_assessment_question_programming_test_cases", force: :cascade do |t|
    t.integer "question_id", null: false
    t.string "identifier", limit: 255, null: false, comment: "Test case identifier generated by the testing framework"
    t.integer "test_case_type", null: false
    t.text "expression"
    t.text "expected"
    t.text "hint"
    t.index ["identifier", "question_id"], name: "index_course_assessment_question_programming_test_case_ident", unique: true
    t.index ["question_id"], name: "fk__course_assessment_quest_18b37224652fc59d955122a17ba20d07"
  end

  create_table "course_assessment_question_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_question_text_response_compre_groups", force: :cascade do |t|
    t.integer "question_id", null: false
    t.decimal "maximum_group_grade", precision: 4, scale: 1, default: "0.0", null: false
    t.index ["question_id"], name: "fk__course_assessment_text_response_compre_group_question"
  end

  create_table "course_assessment_question_text_response_compre_points", force: :cascade do |t|
    t.integer "group_id", null: false
    t.decimal "point_grade", precision: 4, scale: 1, default: "0.0", null: false
    t.index ["group_id"], name: "fk__course_assessment_text_response_compre_point_group"
  end

  create_table "course_assessment_question_text_response_compre_solutions", force: :cascade do |t|
    t.integer "point_id", null: false
    t.integer "solution_type", default: 0, null: false
    t.string "solution", default: [], null: false, array: true
    t.string "solution_lemma", default: [], null: false, array: true
    t.string "information", limit: 255
    t.index ["point_id"], name: "fk__course_assessment_text_response_compre_solution_point"
  end

  create_table "course_assessment_question_text_response_solutions", force: :cascade do |t|
    t.integer "question_id", null: false
    t.integer "solution_type", default: 0, null: false
    t.text "solution", null: false
    t.decimal "grade", precision: 4, scale: 1, default: "0.0", null: false
    t.text "explanation"
    t.index ["question_id"], name: "fk__course_assessment_text_response_solution_question"
  end

  create_table "course_assessment_question_text_responses", force: :cascade do |t|
    t.boolean "allow_attachment", default: false
    t.boolean "hide_text", default: false
    t.boolean "is_comprehension", default: false
  end

  create_table "course_assessment_question_voice_responses", force: :cascade do |t|
  end

  create_table "course_assessment_questions", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.string "title", limit: 255
    t.text "description"
    t.text "staff_only_comments"
    t.decimal "maximum_grade", precision: 4, scale: 1, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_type", "actable_id"], name: "index_course_assessment_questions_actable", unique: true
    t.index ["creator_id"], name: "fk__course_assessment_questions_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_questions_updater_id"
  end

  create_table "course_assessment_skill_branches", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_assessment_skill_branches_course_id"
    t.index ["creator_id"], name: "fk__course_assessment_skill_branches_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_skill_branches_updater_id"
  end

  create_table "course_assessment_skills", force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "skill_branch_id"
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_assessment_skills_course_id"
    t.index ["creator_id"], name: "fk__course_assessment_skills_creator_id"
    t.index ["skill_branch_id"], name: "fk__course_assessment_skills_skill_branch_id"
    t.index ["updater_id"], name: "fk__course_assessment_skills_updater_id"
  end

  create_table "course_assessment_skills_question_assessments", force: :cascade do |t|
    t.integer "question_assessment_id", null: false
    t.integer "skill_id", null: false
    t.index ["question_assessment_id", "skill_id"], name: "index_skills_qn_assessments_on_qa_id_and_skill_id", unique: true
    t.index ["question_assessment_id"], name: "index_course_assessment_skills_question_assessments_on_qa_id"
    t.index ["skill_id"], name: "index_course_assessment_skills_question_assessments_on_skill_id"
  end

  create_table "course_assessment_submission_logs", force: :cascade do |t|
    t.integer "submission_id", null: false
    t.jsonb "request"
    t.datetime "created_at", null: false
    t.index ["submission_id"], name: "fk__course_assessment_submission_logs_submission_id"
  end

  create_table "course_assessment_submission_questions", force: :cascade do |t|
    t.integer "submission_id", null: false
    t.integer "question_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["question_id"], name: "fk__course_assessment_submission_questions_question_id"
    t.index ["submission_id", "question_id"], name: "idx_course_assessment_submission_questions_on_sub_and_qn", unique: true
    t.index ["submission_id"], name: "fk__course_assessment_submission_questions_submission_id"
  end

  create_table "course_assessment_submissions", force: :cascade do |t|
    t.integer "assessment_id", null: false
    t.string "workflow_state", limit: 255, null: false
    t.string "session_id", limit: 255
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "publisher_id"
    t.datetime "published_at"
    t.datetime "submitted_at"
    t.index ["assessment_id", "creator_id"], name: "unique_assessment_id_and_creator_id", unique: true
    t.index ["assessment_id"], name: "fk__course_assessment_submissions_assessment_id"
    t.index ["creator_id"], name: "fk__course_assessment_submissions_creator_id"
    t.index ["publisher_id"], name: "fk__course_assessment_submissions_publisher_id"
    t.index ["updater_id"], name: "fk__course_assessment_submissions_updater_id"
  end

  create_table "course_assessment_tabs", force: :cascade do |t|
    t.integer "category_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "fk__course_assessment_tabs_category_id"
    t.index ["creator_id"], name: "fk__course_assessment_tabs_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_tabs_updater_id"
  end

  create_table "course_assessments", force: :cascade do |t|
    t.integer "tab_id", null: false
    t.boolean "tabbed_view", default: false, null: false
    t.boolean "autograded", null: false
    t.boolean "show_private", default: false, comment: "Show private test cases after students answer correctly"
    t.boolean "show_evaluation", default: false, comment: "Show evaluation test cases after students answer correctly"
    t.boolean "skippable", default: false
    t.boolean "delayed_grade_publication", default: false
    t.string "session_password", limit: 255
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "view_password", limit: 255
    t.boolean "use_public", default: true
    t.boolean "use_private", default: true
    t.boolean "use_evaluation", default: false
    t.boolean "allow_partial_submission", default: false
    t.integer "randomization"
    t.boolean "show_mcq_answer", default: true
    t.boolean "block_student_viewing_after_submitted", default: false
    t.boolean "show_mcq_mrq_solution", default: true
    t.index ["creator_id"], name: "fk__course_assessments_creator_id"
    t.index ["tab_id"], name: "fk__course_assessments_tab_id"
    t.index ["updater_id"], name: "fk__course_assessments_updater_id"
  end

  create_table "course_condition_achievements", force: :cascade do |t|
    t.integer "achievement_id", null: false
    t.index ["achievement_id"], name: "fk__course_condition_achievements_achievement_id"
  end

  create_table "course_condition_assessments", force: :cascade do |t|
    t.integer "assessment_id", null: false
    t.float "minimum_grade_percentage"
    t.index ["assessment_id"], name: "fk__course_condition_assessments_assessment_id"
  end

  create_table "course_condition_levels", force: :cascade do |t|
    t.integer "minimum_level", null: false
  end

  create_table "course_condition_surveys", force: :cascade do |t|
    t.bigint "survey_id", null: false
    t.index ["survey_id"], name: "fk__course_condition_surveys_survey_id"
  end

  create_table "course_conditions", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.integer "conditional_id", null: false
    t.string "conditional_type", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_type", "actable_id"], name: "index_course_conditions_on_actable_type_and_actable_id", unique: true
    t.index ["conditional_type", "conditional_id"], name: "index_course_conditions_on_conditional_type_and_conditional_id"
    t.index ["course_id"], name: "fk__course_conditions_course_id"
    t.index ["creator_id"], name: "fk__course_conditions_creator_id"
    t.index ["updater_id"], name: "fk__course_conditions_updater_id"
  end

  create_table "course_discussion_post_votes", force: :cascade do |t|
    t.integer "post_id", null: false
    t.boolean "vote_flag", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_discussion_post_votes_creator_id"
    t.index ["post_id", "creator_id"], name: "index_course_discussion_post_votes_on_post_id_and_creator_id", unique: true
    t.index ["post_id"], name: "fk__course_discussion_post_votes_post_id"
    t.index ["updater_id"], name: "fk__course_discussion_post_votes_updater_id"
  end

  create_table "course_discussion_posts", force: :cascade do |t|
    t.integer "parent_id"
    t.integer "topic_id", null: false
    t.string "title", limit: 255
    t.text "text"
    t.boolean "answer", default: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_discussion_posts_creator_id"
    t.index ["parent_id"], name: "fk__course_discussion_posts_parent_id"
    t.index ["topic_id"], name: "fk__course_discussion_posts_topic_id"
    t.index ["updater_id"], name: "fk__course_discussion_posts_updater_id"
  end

  create_table "course_discussion_topic_subscriptions", force: :cascade do |t|
    t.integer "topic_id", null: false
    t.integer "user_id", null: false
    t.index ["topic_id", "user_id"], name: "index_topic_subscriptions_on_topic_id_and_user_id", unique: true
    t.index ["topic_id"], name: "fk__course_discussion_topic_subscriptions_topic_id"
    t.index ["user_id"], name: "fk__course_discussion_topic_subscriptions_user_id"
  end

  create_table "course_discussion_topics", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.boolean "pending_staff_reply", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_type", "actable_id"], name: "index_course_discussion_topics_on_actable_type_and_actable_id", unique: true
    t.index ["course_id"], name: "fk__course_discussion_topics_course_id"
  end

  create_table "course_enrol_requests", force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["course_id", "user_id"], name: "index_course_enrol_requests_on_course_id_and_user_id", unique: true
    t.index ["course_id"], name: "fk__course_enrol_requests_course_id"
    t.index ["user_id"], name: "fk__course_enrol_requests_user_id"
  end

  create_table "course_experience_points_records", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "draft_points_awarded"
    t.integer "points_awarded"
    t.integer "course_user_id", null: false
    t.string "reason", limit: 255
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "awarder_id"
    t.datetime "awarded_at"
    t.index ["actable_type", "actable_id"], name: "index_course_experience_points_records_on_actable", unique: true
    t.index ["awarder_id"], name: "fk__course_experience_points_records_awarder_id"
    t.index ["course_user_id"], name: "fk__course_experience_points_records_course_user_id"
    t.index ["creator_id"], name: "fk__course_experience_points_records_creator_id"
    t.index ["updater_id"], name: "fk__course_experience_points_records_updater_id"
  end

  create_table "course_forum_subscriptions", force: :cascade do |t|
    t.integer "forum_id", null: false
    t.integer "user_id", null: false
    t.index ["forum_id", "user_id"], name: "index_course_forum_subscriptions_on_forum_id_and_user_id", unique: true
    t.index ["forum_id"], name: "fk__course_forum_subscriptions_forum_id"
    t.index ["user_id"], name: "fk__course_forum_subscriptions_user_id"
  end

  create_table "course_forum_topic_views", force: :cascade do |t|
    t.integer "topic_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["topic_id"], name: "fk__course_forum_topic_views_topic_id"
    t.index ["user_id"], name: "fk__course_forum_topic_views_user_id"
  end

  create_table "course_forum_topics", force: :cascade do |t|
    t.integer "forum_id", null: false
    t.string "title", limit: 255, null: false
    t.string "slug", limit: 255
    t.boolean "locked", default: false
    t.boolean "hidden", default: false
    t.integer "topic_type", default: 0
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "resolved", default: false, null: false
    t.datetime "latest_post_at", null: false
    t.index ["creator_id"], name: "fk__course_forum_topics_creator_id"
    t.index ["forum_id", "slug"], name: "index_course_forum_topics_on_forum_id_and_slug", unique: true
    t.index ["forum_id"], name: "fk__course_forum_topics_forum_id"
    t.index ["updater_id"], name: "fk__course_forum_topics_updater_id"
  end

  create_table "course_forums", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "name", limit: 255, null: false
    t.string "slug", limit: 255
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id", "slug"], name: "index_course_forums_on_course_id_and_slug", unique: true
    t.index ["course_id"], name: "fk__course_forums_course_id"
    t.index ["creator_id"], name: "fk__course_forums_creator_id"
    t.index ["updater_id"], name: "fk__course_forums_updater_id"
  end

  create_table "course_group_users", force: :cascade do |t|
    t.integer "group_id", null: false
    t.integer "course_user_id", null: false
    t.integer "role", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_user_id", "group_id"], name: "index_course_group_users_on_course_user_id_and_course_group_id", unique: true
    t.index ["course_user_id"], name: "fk__course_group_users_course_user_id"
    t.index ["creator_id"], name: "fk__course_group_users_creator_id"
    t.index ["group_id"], name: "fk__course_group_users_course_group_id"
    t.index ["updater_id"], name: "fk__course_group_users_updater_id"
  end

  create_table "course_groups", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "name", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id", "name"], name: "index_course_groups_on_course_id_and_name", unique: true
    t.index ["course_id"], name: "fk__course_groups_course_id"
    t.index ["creator_id"], name: "fk__course_groups_creator_id"
    t.index ["updater_id"], name: "fk__course_groups_updater_id"
  end

  create_table "course_lesson_plan_event_materials", force: :cascade do |t|
    t.integer "lesson_plan_event_id", null: false
    t.integer "material_id", null: false
    t.index ["lesson_plan_event_id"], name: "fk__course_lesson_plan_event_materials_lesson_plan_event_id"
    t.index ["material_id"], name: "fk__course_lesson_plan_event_materials_material_id"
  end

  create_table "course_lesson_plan_events", force: :cascade do |t|
    t.string "location", limit: 255
    t.string "event_type", limit: 255, null: false
  end

  create_table "course_lesson_plan_items", force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.boolean "published", default: false, null: false
    t.integer "base_exp", null: false
    t.integer "time_bonus_exp", null: false
    t.float "closing_reminder_token"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "triggers_recomputation", default: false, null: false
    t.boolean "movable", default: false, null: false
    t.boolean "has_personal_times", default: false, null: false
    t.boolean "affects_personal_times", default: false, null: false
    t.index ["actable_type", "actable_id"], name: "index_course_lesson_plan_items_on_actable_type_and_actable_id", unique: true
    t.index ["course_id"], name: "fk__course_lesson_plan_items_course_id"
    t.index ["creator_id"], name: "fk__course_lesson_plan_items_creator_id"
    t.index ["updater_id"], name: "fk__course_lesson_plan_items_updater_id"
  end

  create_table "course_lesson_plan_milestones", force: :cascade do |t|
  end

  create_table "course_lesson_plan_todos", force: :cascade do |t|
    t.integer "item_id", null: false
    t.integer "user_id", null: false
    t.string "workflow_state", limit: 255, null: false
    t.boolean "ignore", default: false, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["creator_id"], name: "fk__course_lesson_plan_todos_creator_id"
    t.index ["item_id", "user_id"], name: "index_course_lesson_plan_todos_on_item_id_and_user_id", unique: true
    t.index ["item_id"], name: "fk__course_lesson_plan_todos_item_id"
    t.index ["updater_id"], name: "fk__course_lesson_plan_todos_updater_id"
    t.index ["user_id"], name: "fk__course_lesson_plan_todos_user_id"
  end

  create_table "course_levels", force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "experience_points_threshold", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id", "experience_points_threshold"], name: "index_experience_points_threshold_on_course_id", unique: true
    t.index ["course_id"], name: "fk__course_levels_course_id"
  end

  create_table "course_material_folders", force: :cascade do |t|
    t.integer "parent_id"
    t.integer "course_id", null: false
    t.integer "owner_id"
    t.string "owner_type", limit: 255
    t.string "name", limit: 255, null: false
    t.text "description"
    t.boolean "can_student_upload", default: false, null: false
    t.datetime "start_at", null: false
    t.datetime "end_at"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "parent_id, lower((name)::text)", name: "index_course_material_folders_on_parent_id_and_name", unique: true
    t.index ["course_id"], name: "fk__course_material_folders_course_id"
    t.index ["creator_id"], name: "fk__course_material_folders_creator_id"
    t.index ["owner_id", "owner_type"], name: "index_course_material_folders_on_owner_id_and_owner_type", unique: true
    t.index ["owner_type", "owner_id"], name: "fk__course_material_folders_owner_id"
    t.index ["parent_id"], name: "fk__course_material_folders_parent_id"
    t.index ["updater_id"], name: "fk__course_material_folders_updater_id"
  end

  create_table "course_materials", force: :cascade do |t|
    t.integer "folder_id", null: false
    t.string "name", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "folder_id, lower((name)::text)", name: "index_course_materials_on_folder_id_and_name", unique: true
    t.index ["creator_id"], name: "fk__course_materials_creator_id"
    t.index ["folder_id"], name: "fk__course_materials_folder_id"
    t.index ["updater_id"], name: "fk__course_materials_updater_id"
  end

  create_table "course_notifications", force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "course_id", null: false
    t.integer "notification_type", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_id"], name: "index_course_notifications_on_activity_id"
    t.index ["course_id"], name: "index_course_notifications_on_course_id"
  end

  create_table "course_personal_times", force: :cascade do |t|
    t.bigint "course_user_id", null: false
    t.bigint "lesson_plan_item_id", null: false
    t.datetime "start_at", null: false
    t.datetime "bonus_end_at"
    t.datetime "end_at"
    t.boolean "fixed", default: false, null: false
    t.index ["course_user_id"], name: "index_course_personal_times_on_course_user_id"
    t.index ["lesson_plan_item_id"], name: "index_course_personal_times_on_lesson_plan_item_id"
  end

  create_table "course_question_assessments", force: :cascade do |t|
    t.integer "question_id", null: false
    t.integer "assessment_id", null: false
    t.integer "weight", null: false
    t.index ["assessment_id"], name: "index_course_question_assessments_on_assessment_id"
    t.index ["question_id", "assessment_id"], name: "index_question_assessments_on_question_id_and_assessment_id", unique: true
    t.index ["question_id"], name: "index_course_question_assessments_on_question_id"
  end

  create_table "course_reference_timelines", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.boolean "default", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_course_reference_timelines_on_course_id"
  end

  create_table "course_reference_times", force: :cascade do |t|
    t.bigint "reference_timeline_id", null: false
    t.bigint "lesson_plan_item_id", null: false
    t.datetime "start_at", null: false
    t.datetime "bonus_end_at"
    t.datetime "end_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["lesson_plan_item_id"], name: "index_course_reference_times_on_lesson_plan_item_id"
    t.index ["reference_timeline_id"], name: "index_course_reference_times_on_reference_timeline_id"
  end

  create_table "course_survey_answer_options", force: :cascade do |t|
    t.integer "answer_id", null: false
    t.integer "question_option_id", null: false
    t.index ["answer_id"], name: "fk__course_survey_answer_options_answer_id"
    t.index ["question_option_id"], name: "fk__course_survey_answer_options_question_option_id"
  end

  create_table "course_survey_answers", force: :cascade do |t|
    t.integer "question_id", null: false
    t.integer "response_id", null: false
    t.text "text_response"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_survey_answers_creator_id"
    t.index ["question_id"], name: "fk__course_survey_answers_question_id"
    t.index ["response_id"], name: "fk__course_survey_answers_response_id"
    t.index ["updater_id"], name: "fk__course_survey_answers_updater_id"
  end

  create_table "course_survey_question_options", force: :cascade do |t|
    t.integer "question_id", null: false
    t.text "option"
    t.integer "weight", null: false
    t.index ["question_id"], name: "fk__course_survey_question_options_question_id"
  end

  create_table "course_survey_questions", force: :cascade do |t|
    t.integer "section_id", null: false
    t.integer "question_type", default: 0, null: false
    t.text "description", null: false
    t.integer "weight", null: false
    t.boolean "required", default: false, null: false
    t.boolean "grid_view", default: false, null: false
    t.integer "max_options"
    t.integer "min_options"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_survey_questions_creator_id"
    t.index ["section_id"], name: "index_course_survey_questions_on_section_id"
    t.index ["updater_id"], name: "fk__course_survey_questions_updater_id"
  end

  create_table "course_survey_responses", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.datetime "submitted_at"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_survey_responses_creator_id"
    t.index ["survey_id", "creator_id"], name: "index_course_survey_responses_on_survey_id_and_creator_id", unique: true
    t.index ["survey_id"], name: "fk__course_survey_responses_survey_id"
    t.index ["updater_id"], name: "fk__course_survey_responses_updater_id"
  end

  create_table "course_survey_sections", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "weight", null: false
    t.index ["survey_id"], name: "fk__course_survey_sections_survey_id"
  end

  create_table "course_surveys", force: :cascade do |t|
    t.boolean "anonymous", default: false, null: false
    t.boolean "allow_modify_after_submit", default: false, null: false
    t.boolean "allow_response_after_end", default: false, null: false
    t.datetime "closing_reminded_at"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_surveys_creator_id"
    t.index ["updater_id"], name: "fk__course_surveys_updater_id"
  end

  create_table "course_user_achievements", force: :cascade do |t|
    t.integer "course_user_id"
    t.integer "achievement_id"
    t.datetime "obtained_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["achievement_id"], name: "fk__course_user_achievements_achievement_id"
    t.index ["course_user_id", "achievement_id"], name: "index_user_achievements_on_course_user_id_and_achievement_id", unique: true
    t.index ["course_user_id"], name: "fk__course_user_achievements_course_user_id"
  end

  create_table "course_user_invitations", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "name", limit: 255, null: false
    t.string "email", limit: 255, null: false
    t.integer "role", default: 0, null: false
    t.boolean "phantom", default: false, null: false
    t.string "invitation_key", limit: 32, null: false
    t.datetime "sent_at"
    t.datetime "confirmed_at"
    t.integer "confirmer_id"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_course_user_invitations_on_email"
    t.index ["confirmer_id"], name: "fk__course_user_invitations_confirmer_id"
    t.index ["course_id", "email"], name: "index_course_user_invitations_on_course_id_and_email", unique: true
    t.index ["course_id"], name: "fk__course_user_invitations_course_id"
    t.index ["creator_id"], name: "fk__course_user_invitations_creator_id"
    t.index ["invitation_key"], name: "index_course_user_invitations_on_invitation_key", unique: true
    t.index ["updater_id"], name: "fk__course_user_invitations_updater_id"
  end

  create_table "course_users", force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "user_id", null: false
    t.integer "role", default: 0, null: false
    t.string "name", limit: 255, null: false
    t.boolean "phantom", default: false, null: false
    t.datetime "last_active_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.bigint "reference_timeline_id"
    t.integer "timeline_algorithm", default: 0, null: false
    t.index ["course_id", "user_id"], name: "index_course_users_on_course_id_and_user_id", unique: true
    t.index ["course_id"], name: "fk__course_users_course_id"
    t.index ["creator_id"], name: "fk__course_users_creator_id"
    t.index ["reference_timeline_id"], name: "index_course_users_on_reference_timeline_id"
    t.index ["updater_id"], name: "fk__course_users_updater_id"
    t.index ["user_id"], name: "fk__course_users_user_id"
  end

  create_table "course_video_events", force: :cascade do |t|
    t.integer "session_id", null: false
    t.integer "event_type", null: false
    t.integer "sequence_num", null: false
    t.integer "video_time", null: false
    t.float "playback_rate"
    t.datetime "event_time", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id", "sequence_num"], name: "index_course_video_events_on_session_id_and_sequence_num", unique: true
    t.index ["session_id"], name: "index_course_video_events_on_session_id"
  end

  create_table "course_video_sessions", force: :cascade do |t|
    t.integer "submission_id", null: false
    t.datetime "session_start", null: false
    t.datetime "session_end", null: false
    t.integer "last_video_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.index ["creator_id"], name: "index_course_video_sessions_on_creator_id"
    t.index ["submission_id"], name: "index_course_video_sessions_on_submission_id"
    t.index ["updater_id"], name: "index_course_video_sessions_on_updater_id"
  end

  create_table "course_video_statistics", force: :cascade do |t|
    t.integer "video_id", null: false
    t.integer "watch_freq", default: [], array: true
    t.integer "percent_watched", default: 0, null: false
    t.boolean "cached", default: false, null: false
    t.index ["video_id"], name: "index_course_video_statistics_on_video_id"
  end

  create_table "course_video_submission_statistics", force: :cascade do |t|
    t.integer "submission_id", null: false
    t.integer "watch_freq", default: [], array: true
    t.integer "percent_watched", default: 0, null: false
    t.boolean "cached", default: false, null: false
    t.index ["submission_id"], name: "index_course_video_submission_statistics_on_submission_id"
  end

  create_table "course_video_submissions", force: :cascade do |t|
    t.integer "video_id", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__course_video_submissions_creator_id"
    t.index ["updater_id"], name: "fk__course_video_submissions_updater_id"
    t.index ["video_id", "creator_id"], name: "index_course_video_submissions_on_video_id_and_creator_id", unique: true
    t.index ["video_id"], name: "fk__course_video_submissions_video_id"
  end

  create_table "course_video_tabs", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_video_tabs_course_id"
    t.index ["creator_id"], name: "fk__course_video_tabs_creator_id"
    t.index ["updater_id"], name: "fk__course_video_tabs_updater_id"
  end

  create_table "course_video_topics", force: :cascade do |t|
    t.integer "video_id", null: false
    t.integer "timestamp", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.index ["creator_id"], name: "index_course_video_topics_on_creator_id"
    t.index ["updater_id"], name: "index_course_video_topics_on_updater_id"
    t.index ["video_id"], name: "fk__course_video_topics_video_id"
  end

  create_table "course_videos", force: :cascade do |t|
    t.integer "tab_id", null: false
    t.string "url", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "duration", default: 0, null: false
    t.index ["creator_id"], name: "fk__course_videos_creator_id"
    t.index ["tab_id"], name: "fk__course_videos_tab_id"
    t.index ["updater_id"], name: "fk__course_videos_updater_id"
  end

  create_table "course_virtual_classrooms", force: :cascade do |t|
    t.integer "course_id", null: false
    t.text "instructor_classroom_link"
    t.integer "classroom_id"
    t.string "title", limit: 255, null: false
    t.text "content"
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "instructor_id"
    t.jsonb "recorded_videos"
    t.index ["course_id"], name: "fk__course_virtual_classrooms_course_id"
    t.index ["creator_id"], name: "fk__course_virtual_classrooms_creator_id"
    t.index ["instructor_id"], name: "index_course_virtual_classrooms_on_instructor_id"
    t.index ["updater_id"], name: "fk__course_virtual_classrooms_updater_id"
  end

  create_table "courses", force: :cascade do |t|
    t.integer "instance_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.text "logo"
    t.boolean "published", default: false, null: false
    t.boolean "enrollable", default: false, null: false
    t.string "registration_key", limit: 16
    t.text "settings"
    t.boolean "gamified", default: true, null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.string "time_zone", limit: 255
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "show_personalized_timeline_features", default: false, null: false
    t.index ["creator_id"], name: "fk__courses_creator_id"
    t.index ["instance_id"], name: "fk__courses_instance_id"
    t.index ["registration_key"], name: "index_courses_on_registration_key", unique: true
    t.index ["updater_id"], name: "fk__courses_updater_id"
  end

  create_table "generic_announcements", force: :cascade do |t|
    t.string "type", limit: 255, null: false
    t.integer "instance_id", comment: "The instance this announcement is associated with. This only applies to instance announcements."
    t.string "title", limit: 255, null: false
    t.text "content"
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "fk__generic_announcements_creator_id"
    t.index ["instance_id"], name: "fk__generic_announcements_instance_id"
    t.index ["updater_id"], name: "fk__generic_announcements_updater_id"
  end

  create_table "instance_user_invitations", force: :cascade do |t|
    t.integer "instance_id", null: false
    t.string "name", limit: 255, null: false
    t.string "email", limit: 255, null: false
    t.integer "role", default: 0, null: false
    t.string "invitation_key", limit: 32, null: false
    t.datetime "sent_at"
    t.datetime "confirmed_at"
    t.integer "confirmer_id"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_instance_user_invitations_on_lower_email_text"
    t.index ["instance_id", "email"], name: "index_instance_user_invitations_on_instance_id_and_email", unique: true
    t.index ["instance_id"], name: "index_instance_user_invitations_on_instance_id"
    t.index ["invitation_key"], name: "index_instance_user_invitations_on_invitation_key"
  end

  create_table "instance_user_role_requests", force: :cascade do |t|
    t.integer "instance_id", null: false
    t.integer "user_id", null: false
    t.integer "role", null: false
    t.string "organization", limit: 255
    t.string "designation", limit: 255
    t.text "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["instance_id"], name: "fk__instance_user_role_requests_instance_id"
    t.index ["user_id"], name: "fk__instance_user_role_requests_user_id"
  end

  create_table "instance_users", force: :cascade do |t|
    t.integer "instance_id", null: false
    t.integer "user_id", null: false
    t.integer "role", default: 0, null: false
    t.datetime "last_active_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["instance_id", "user_id"], name: "index_instance_users_on_instance_id_and_user_id", unique: true
    t.index ["instance_id"], name: "fk__instance_users_instance_id"
  end

  create_table "instances", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "host", limit: 255, null: false, comment: "Stores the host name of the instance. The www prefix is automatically handled by the application"
    t.text "settings"
    t.index "lower((host)::text)", name: "index_instances_on_host", unique: true
  end

  create_table "jobs", id: :uuid, default: nil, force: :cascade do |t|
    t.integer "status", default: 0, null: false
    t.string "redirect_to", limit: 255
    t.json "error"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "polyglot_languages", force: :cascade do |t|
    t.string "type", limit: 255, null: false, comment: "The class of language, as perceived by the application."
    t.string "name", limit: 255, null: false
    t.integer "parent_id"
    t.index "lower((name)::text)", name: "index_polyglot_languages_on_name", unique: true
    t.index ["parent_id"], name: "fk__polyglot_languages_parent_id"
  end

  create_table "read_marks", force: :cascade do |t|
    t.integer "readable_id"
    t.string "readable_type", limit: 255, null: false
    t.integer "reader_id", null: false
    t.datetime "timestamp"
    t.string "reader_type", limit: 255
    t.index ["reader_id", "reader_type", "readable_type", "readable_id"], name: "read_marks_reader_readable_index", unique: true
  end

  create_table "user_emails", force: :cascade do |t|
    t.boolean "primary", default: false, null: false
    t.integer "user_id"
    t.string "email", limit: 255, null: false
    t.string "confirmation_token", limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email", limit: 255
    t.index "lower((email)::text)", name: "index_user_emails_on_email", unique: true
    t.index ["confirmation_token"], name: "index_user_emails_on_confirmation_token", unique: true
    t.index ["user_id", "primary"], name: "index_user_emails_on_user_id_and_primary", unique: true, where: "(\"primary\" <> false)"
  end

  create_table "user_identities", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "provider", limit: 255, null: false
    t.string "uid", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_user_identities_on_provider_and_uid", unique: true
    t.index ["user_id"], name: "fk__user_identities_user_id"
  end

  create_table "user_notifications", force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "user_id", null: false
    t.integer "notification_type", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_id"], name: "index_user_notifications_on_activity_id"
    t.index ["user_id"], name: "index_user_notifications_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.integer "role", default: 0, null: false
    t.string "time_zone", limit: 255
    t.text "profile_photo"
    t.string "encrypted_password", limit: 255, default: "", null: false
    t.string "reset_password_token", limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "course_achievements", "courses", name: "fk_course_achievements_course_id"
  add_foreign_key "course_achievements", "users", column: "creator_id", name: "fk_course_achievements_creator_id"
  add_foreign_key "course_achievements", "users", column: "updater_id", name: "fk_course_achievements_updater_id"
  add_foreign_key "course_announcements", "courses", name: "fk_course_announcements_course_id"
  add_foreign_key "course_announcements", "users", column: "creator_id", name: "fk_course_announcements_creator_id"
  add_foreign_key "course_announcements", "users", column: "updater_id", name: "fk_course_announcements_updater_id"
  add_foreign_key "course_assessment_answer_auto_gradings", "course_assessment_answers", column: "answer_id", name: "fk_course_assessment_answer_auto_gradings_answer_id"
  add_foreign_key "course_assessment_answer_auto_gradings", "jobs", name: "fk_course_assessment_answer_auto_gradings_job_id", on_delete: :nullify
  add_foreign_key "course_assessment_answer_multiple_response_options", "course_assessment_answer_multiple_responses", column: "answer_id", name: "fk_course_assessment_answer_multiple_response_options_answer_id"
  add_foreign_key "course_assessment_answer_multiple_response_options", "course_assessment_question_multiple_response_options", column: "option_id", name: "fk_course_assessment_answer_multiple_response_options_option_id"
  add_foreign_key "course_assessment_answer_programming_file_annotations", "course_assessment_answer_programming_files", column: "file_id", name: "fk_course_assessment_answer_ed21459e7a2a5034dcf43a14812cb17d"
  add_foreign_key "course_assessment_answer_programming_files", "course_assessment_answer_programming", column: "answer_id", name: "fk_course_assessment_answer_programming_files_answer_id"
  add_foreign_key "course_assessment_answer_programming_test_results", "course_assessment_answer_programming_auto_gradings", column: "auto_grading_id", name: "fk_course_assessment_answer_e3d785447112439bb306849be8690102"
  add_foreign_key "course_assessment_answer_programming_test_results", "course_assessment_question_programming_test_cases", column: "test_case_id", name: "fk_course_assessment_answer_bbb492885b1e3dca4433b8af8cb95906"
  add_foreign_key "course_assessment_answer_scribing_scribbles", "course_assessment_answer_scribings", column: "answer_id", name: "fk_course_assessment_answer_scribing_scribbles_answer_id"
  add_foreign_key "course_assessment_answer_scribing_scribbles", "users", column: "creator_id", name: "fk_course_assessment_answer_scribing_scribbles_creator_id"
  add_foreign_key "course_assessment_answers", "course_assessment_questions", column: "question_id", name: "fk_course_assessment_answers_question_id"
  add_foreign_key "course_assessment_answers", "course_assessment_submissions", column: "submission_id", name: "fk_course_assessment_answers_submission_id"
  add_foreign_key "course_assessment_answers", "users", column: "grader_id", name: "fk_course_assessment_answers_grader_id"
  add_foreign_key "course_assessment_categories", "courses", name: "fk_course_assessment_categories_course_id"
  add_foreign_key "course_assessment_categories", "users", column: "creator_id", name: "fk_course_assessment_categories_creator_id"
  add_foreign_key "course_assessment_categories", "users", column: "updater_id", name: "fk_course_assessment_categories_updater_id"
  add_foreign_key "course_assessment_question_bundle_assignments", "course_assessment_question_bundles", column: "bundle_id"
  add_foreign_key "course_assessment_question_bundle_assignments", "course_assessment_submissions", column: "submission_id"
  add_foreign_key "course_assessment_question_bundle_assignments", "course_assessments", column: "assessment_id"
  add_foreign_key "course_assessment_question_bundle_assignments", "users"
  add_foreign_key "course_assessment_question_bundle_questions", "course_assessment_question_bundles", column: "bundle_id"
  add_foreign_key "course_assessment_question_bundle_questions", "course_assessment_questions", column: "question_id"
  add_foreign_key "course_assessment_question_bundles", "course_assessment_question_groups", column: "group_id"
  add_foreign_key "course_assessment_question_groups", "course_assessments", column: "assessment_id"
  add_foreign_key "course_assessment_question_multiple_response_options", "course_assessment_question_multiple_responses", column: "question_id", name: "fk_course_assessment_question_multiple_response_options_questio"
  add_foreign_key "course_assessment_question_programming", "jobs", column: "import_job_id", name: "fk_course_assessment_question_programming_import_job_id", on_delete: :nullify
  add_foreign_key "course_assessment_question_programming", "polyglot_languages", column: "language_id", name: "fk_course_assessment_question_programming_language_id"
  add_foreign_key "course_assessment_question_programming_template_files", "course_assessment_question_programming", column: "question_id", name: "fk_course_assessment_questi_0788633b496294e558f55f2b41bc7c45"
  add_foreign_key "course_assessment_question_programming_test_cases", "course_assessment_question_programming", column: "question_id", name: "fk_course_assessment_questi_ee00a2daf4389c4c2ddba3041a15c35f"
  add_foreign_key "course_assessment_question_text_response_compre_groups", "course_assessment_question_text_responses", column: "question_id"
  add_foreign_key "course_assessment_question_text_response_compre_points", "course_assessment_question_text_response_compre_groups", column: "group_id"
  add_foreign_key "course_assessment_question_text_response_compre_solutions", "course_assessment_question_text_response_compre_points", column: "point_id"
  add_foreign_key "course_assessment_question_text_response_solutions", "course_assessment_question_text_responses", column: "question_id", name: "fk_course_assessment_questi_2fbeabfad04f21c2d05c8b2d9100d1c4"
  add_foreign_key "course_assessment_questions", "users", column: "creator_id", name: "fk_course_assessment_questions_creator_id"
  add_foreign_key "course_assessment_questions", "users", column: "updater_id", name: "fk_course_assessment_questions_updater_id"
  add_foreign_key "course_assessment_skill_branches", "courses", name: "fk_course_assessment_skill_branches_course_id"
  add_foreign_key "course_assessment_skill_branches", "users", column: "creator_id", name: "fk_course_assessment_skill_branches_creator_id"
  add_foreign_key "course_assessment_skill_branches", "users", column: "updater_id", name: "fk_course_assessment_skill_branches_updater_id"
  add_foreign_key "course_assessment_skills", "course_assessment_skill_branches", column: "skill_branch_id", name: "fk_course_assessment_skills_skill_branch_id"
  add_foreign_key "course_assessment_skills", "courses", name: "fk_course_assessment_skills_course_id"
  add_foreign_key "course_assessment_skills", "users", column: "creator_id", name: "fk_course_assessment_skills_creator_id"
  add_foreign_key "course_assessment_skills", "users", column: "updater_id", name: "fk_course_assessment_skills_updater_id"
  add_foreign_key "course_assessment_skills_question_assessments", "course_assessment_skills", column: "skill_id"
  add_foreign_key "course_assessment_skills_question_assessments", "course_question_assessments", column: "question_assessment_id"
  add_foreign_key "course_assessment_submission_logs", "course_assessment_submissions", column: "submission_id", name: "fk_course_assessment_submission_logs_submission_id"
  add_foreign_key "course_assessment_submission_questions", "course_assessment_questions", column: "question_id", name: "fk_course_assessment_submission_questions_question_id"
  add_foreign_key "course_assessment_submission_questions", "course_assessment_submissions", column: "submission_id", name: "fk_course_assessment_submission_questions_submission_id"
  add_foreign_key "course_assessment_submissions", "course_assessments", column: "assessment_id", name: "fk_course_assessment_submissions_assessment_id"
  add_foreign_key "course_assessment_submissions", "users", column: "creator_id", name: "fk_course_assessment_submissions_creator_id"
  add_foreign_key "course_assessment_submissions", "users", column: "publisher_id", name: "fk_course_assessment_submissions_publisher_id"
  add_foreign_key "course_assessment_submissions", "users", column: "updater_id", name: "fk_course_assessment_submissions_updater_id"
  add_foreign_key "course_assessment_tabs", "course_assessment_categories", column: "category_id", name: "fk_course_assessment_tabs_category_id"
  add_foreign_key "course_assessment_tabs", "users", column: "creator_id", name: "fk_course_assessment_tabs_creator_id"
  add_foreign_key "course_assessment_tabs", "users", column: "updater_id", name: "fk_course_assessment_tabs_updater_id"
  add_foreign_key "course_assessments", "course_assessment_tabs", column: "tab_id", name: "fk_course_assessments_tab_id"
  add_foreign_key "course_assessments", "users", column: "creator_id", name: "fk_course_assessments_creator_id"
  add_foreign_key "course_assessments", "users", column: "updater_id", name: "fk_course_assessments_updater_id"
  add_foreign_key "course_condition_achievements", "course_achievements", column: "achievement_id", name: "fk_course_condition_achievements_achievement_id"
  add_foreign_key "course_condition_assessments", "course_assessments", column: "assessment_id", name: "fk_course_condition_assessments_assessment_id"
  add_foreign_key "course_condition_surveys", "course_surveys", column: "survey_id"
  add_foreign_key "course_conditions", "courses", name: "fk_course_conditions_course_id"
  add_foreign_key "course_conditions", "users", column: "creator_id", name: "fk_course_conditions_creator_id"
  add_foreign_key "course_conditions", "users", column: "updater_id", name: "fk_course_conditions_updater_id"
  add_foreign_key "course_discussion_post_votes", "course_discussion_posts", column: "post_id", name: "fk_course_discussion_post_votes_post_id"
  add_foreign_key "course_discussion_post_votes", "users", column: "creator_id", name: "fk_course_discussion_post_votes_creator_id"
  add_foreign_key "course_discussion_post_votes", "users", column: "updater_id", name: "fk_course_discussion_post_votes_updater_id"
  add_foreign_key "course_discussion_posts", "course_discussion_posts", column: "parent_id", name: "fk_course_discussion_posts_parent_id"
  add_foreign_key "course_discussion_posts", "course_discussion_topics", column: "topic_id", name: "fk_course_discussion_posts_topic_id"
  add_foreign_key "course_discussion_posts", "users", column: "creator_id", name: "fk_course_discussion_posts_creator_id"
  add_foreign_key "course_discussion_posts", "users", column: "updater_id", name: "fk_course_discussion_posts_updater_id"
  add_foreign_key "course_discussion_topic_subscriptions", "course_discussion_topics", column: "topic_id", name: "fk_course_discussion_topic_subscriptions_topic_id"
  add_foreign_key "course_discussion_topic_subscriptions", "users", name: "fk_course_discussion_topic_subscriptions_user_id"
  add_foreign_key "course_discussion_topics", "courses", name: "fk_course_discussion_topics_course_id"
  add_foreign_key "course_enrol_requests", "courses", name: "fk_course_enrol_requests_course_id"
  add_foreign_key "course_enrol_requests", "users", name: "fk_course_enrol_requests_user_id"
  add_foreign_key "course_experience_points_records", "course_users", name: "fk_course_experience_points_records_course_user_id"
  add_foreign_key "course_experience_points_records", "users", column: "awarder_id", name: "fk_course_experience_points_records_awarder_id"
  add_foreign_key "course_experience_points_records", "users", column: "creator_id", name: "fk_course_experience_points_records_creator_id"
  add_foreign_key "course_experience_points_records", "users", column: "updater_id", name: "fk_course_experience_points_records_updater_id"
  add_foreign_key "course_forum_subscriptions", "course_forums", column: "forum_id", name: "fk_course_forum_subscriptions_forum_id"
  add_foreign_key "course_forum_subscriptions", "users", name: "fk_course_forum_subscriptions_user_id"
  add_foreign_key "course_forum_topic_views", "course_forum_topics", column: "topic_id", name: "fk_course_forum_topic_views_topic_id"
  add_foreign_key "course_forum_topic_views", "users", name: "fk_course_forum_topic_views_user_id"
  add_foreign_key "course_forum_topics", "course_forums", column: "forum_id", name: "fk_course_forum_topics_forum_id"
  add_foreign_key "course_forum_topics", "users", column: "creator_id", name: "fk_course_forum_topics_creator_id"
  add_foreign_key "course_forum_topics", "users", column: "updater_id", name: "fk_course_forum_topics_updater_id"
  add_foreign_key "course_forums", "courses", name: "fk_course_forums_course_id"
  add_foreign_key "course_forums", "users", column: "creator_id", name: "fk_course_forums_creator_id"
  add_foreign_key "course_forums", "users", column: "updater_id", name: "fk_course_forums_updater_id"
  add_foreign_key "course_group_users", "course_groups", column: "group_id", name: "fk_course_group_users_course_group_id"
  add_foreign_key "course_group_users", "course_users", name: "fk_course_group_users_course_user_id"
  add_foreign_key "course_group_users", "users", column: "creator_id", name: "fk_course_group_users_creator_id"
  add_foreign_key "course_group_users", "users", column: "updater_id", name: "fk_course_group_users_updater_id"
  add_foreign_key "course_groups", "courses", name: "fk_course_groups_course_id"
  add_foreign_key "course_groups", "users", column: "creator_id", name: "fk_course_groups_creator_id"
  add_foreign_key "course_groups", "users", column: "updater_id", name: "fk_course_groups_updater_id"
  add_foreign_key "course_lesson_plan_event_materials", "course_lesson_plan_events", column: "lesson_plan_event_id", name: "fk_course_lesson_plan_event_materials_lesson_plan_event_id"
  add_foreign_key "course_lesson_plan_event_materials", "course_materials", column: "material_id", name: "fk_course_lesson_plan_event_materials_material_id"
  add_foreign_key "course_lesson_plan_items", "courses", name: "fk_course_lesson_plan_items_course_id"
  add_foreign_key "course_lesson_plan_items", "users", column: "creator_id", name: "fk_course_lesson_plan_items_creator_id"
  add_foreign_key "course_lesson_plan_items", "users", column: "updater_id", name: "fk_course_lesson_plan_items_updater_id"
  add_foreign_key "course_lesson_plan_todos", "course_lesson_plan_items", column: "item_id", name: "fk_course_lesson_plan_todos_item_id"
  add_foreign_key "course_lesson_plan_todos", "users", column: "creator_id", name: "fk_course_lesson_plan_todos_creator_id"
  add_foreign_key "course_lesson_plan_todos", "users", column: "updater_id", name: "fk_course_lesson_plan_todos_updater_id"
  add_foreign_key "course_lesson_plan_todos", "users", name: "fk_course_lesson_plan_todos_user_id"
  add_foreign_key "course_levels", "courses", name: "fk_course_levels_course_id"
  add_foreign_key "course_material_folders", "course_material_folders", column: "parent_id", name: "fk_course_material_folders_parent_id"
  add_foreign_key "course_material_folders", "courses", name: "fk_course_material_folders_course_id"
  add_foreign_key "course_material_folders", "users", column: "creator_id", name: "fk_course_material_folders_creator_id"
  add_foreign_key "course_material_folders", "users", column: "updater_id", name: "fk_course_material_folders_updater_id"
  add_foreign_key "course_materials", "course_material_folders", column: "folder_id", name: "fk_course_materials_folder_id"
  add_foreign_key "course_materials", "users", column: "creator_id", name: "fk_course_materials_creator_id"
  add_foreign_key "course_materials", "users", column: "updater_id", name: "fk_course_materials_updater_id"
  add_foreign_key "course_notifications", "courses", name: "fk_course_notifications_course_id"
  add_foreign_key "course_personal_times", "course_lesson_plan_items", column: "lesson_plan_item_id"
  add_foreign_key "course_personal_times", "course_users"
  add_foreign_key "course_question_assessments", "course_assessment_questions", column: "question_id", name: "fk_course_question_assessments_question_id"
  add_foreign_key "course_question_assessments", "course_assessments", column: "assessment_id", name: "fk_course_question_assessments_assessment_id"
  add_foreign_key "course_reference_timelines", "courses"
  add_foreign_key "course_reference_times", "course_lesson_plan_items", column: "lesson_plan_item_id"
  add_foreign_key "course_reference_times", "course_reference_timelines", column: "reference_timeline_id"
  add_foreign_key "course_survey_answer_options", "course_survey_answers", column: "answer_id", name: "fk_course_survey_answer_options_answer_id"
  add_foreign_key "course_survey_answer_options", "course_survey_question_options", column: "question_option_id", name: "fk_course_survey_answer_options_question_option_id"
  add_foreign_key "course_survey_answers", "course_survey_questions", column: "question_id", name: "fk_course_survey_answers_question_id"
  add_foreign_key "course_survey_answers", "course_survey_responses", column: "response_id", name: "fk_course_survey_answers_response_id"
  add_foreign_key "course_survey_answers", "users", column: "creator_id", name: "fk_course_survey_answers_creator_id"
  add_foreign_key "course_survey_answers", "users", column: "updater_id", name: "fk_course_survey_answers_updater_id"
  add_foreign_key "course_survey_question_options", "course_survey_questions", column: "question_id", name: "fk_course_survey_question_options_question_id"
  add_foreign_key "course_survey_questions", "course_survey_sections", column: "section_id", name: "fk_course_survey_questions_section_id"
  add_foreign_key "course_survey_questions", "users", column: "creator_id", name: "fk_course_survey_questions_creator_id"
  add_foreign_key "course_survey_questions", "users", column: "updater_id", name: "fk_course_survey_questions_updater_id"
  add_foreign_key "course_survey_responses", "course_surveys", column: "survey_id", name: "fk_course_survey_responses_survey_id"
  add_foreign_key "course_survey_responses", "users", column: "creator_id", name: "fk_course_survey_responses_creator_id"
  add_foreign_key "course_survey_responses", "users", column: "updater_id", name: "fk_course_survey_responses_updater_id"
  add_foreign_key "course_survey_sections", "course_surveys", column: "survey_id", name: "fk_course_survey_sections_survey_id"
  add_foreign_key "course_surveys", "users", column: "creator_id", name: "fk_course_surveys_creator_id"
  add_foreign_key "course_surveys", "users", column: "updater_id", name: "fk_course_surveys_updater_id"
  add_foreign_key "course_user_achievements", "course_achievements", column: "achievement_id", name: "fk_course_user_achievements_achievement_id"
  add_foreign_key "course_user_achievements", "course_users", name: "fk_course_user_achievements_course_user_id"
  add_foreign_key "course_user_invitations", "courses", name: "fk_course_user_invitations_course_id"
  add_foreign_key "course_user_invitations", "users", column: "confirmer_id", name: "fk_course_user_invitations_confirmer_id"
  add_foreign_key "course_user_invitations", "users", column: "creator_id", name: "fk_course_user_invitations_creator_id"
  add_foreign_key "course_user_invitations", "users", column: "updater_id", name: "fk_course_user_invitations_updater_id"
  add_foreign_key "course_users", "course_reference_timelines", column: "reference_timeline_id"
  add_foreign_key "course_users", "courses", name: "fk_course_users_course_id"
  add_foreign_key "course_users", "users", column: "creator_id", name: "fk_course_users_creator_id"
  add_foreign_key "course_users", "users", column: "updater_id", name: "fk_course_users_updater_id"
  add_foreign_key "course_users", "users", name: "fk_course_users_user_id"
  add_foreign_key "course_video_events", "course_video_sessions", column: "session_id"
  add_foreign_key "course_video_sessions", "course_video_submissions", column: "submission_id"
  add_foreign_key "course_video_sessions", "users", column: "creator_id"
  add_foreign_key "course_video_sessions", "users", column: "updater_id"
  add_foreign_key "course_video_statistics", "course_videos", column: "video_id", on_delete: :cascade
  add_foreign_key "course_video_submission_statistics", "course_video_submissions", column: "submission_id", on_delete: :cascade
  add_foreign_key "course_video_submissions", "course_videos", column: "video_id", name: "fk_course_video_submissions_video_id"
  add_foreign_key "course_video_submissions", "users", column: "creator_id", name: "fk_course_video_submissions_creator_id"
  add_foreign_key "course_video_submissions", "users", column: "updater_id", name: "fk_course_video_submissions_updater_id"
  add_foreign_key "course_video_tabs", "courses"
  add_foreign_key "course_video_tabs", "users", column: "creator_id"
  add_foreign_key "course_video_tabs", "users", column: "updater_id"
  add_foreign_key "course_video_topics", "course_videos", column: "video_id", name: "fk_course_video_topics_video_id"
  add_foreign_key "course_video_topics", "users", column: "creator_id", name: "fk_course_video_topics_creator_id"
  add_foreign_key "course_video_topics", "users", column: "updater_id", name: "fk_course_video_topics_updater_id"
  add_foreign_key "course_videos", "course_video_tabs", column: "tab_id"
  add_foreign_key "course_videos", "users", column: "creator_id", name: "fk_course_videos_creator_id"
  add_foreign_key "course_videos", "users", column: "updater_id", name: "fk_course_videos_updater_id"
  add_foreign_key "course_virtual_classrooms", "courses", name: "fk_course_virtual_classrooms_course_id"
  add_foreign_key "course_virtual_classrooms", "users", column: "creator_id", name: "fk_course_virtual_classrooms_creator_id"
  add_foreign_key "course_virtual_classrooms", "users", column: "instructor_id", name: "fk_course_virtual_classrooms_instructor_id", on_update: :cascade, on_delete: :nullify
  add_foreign_key "course_virtual_classrooms", "users", column: "updater_id", name: "fk_course_virtual_classrooms_updater_id"
  add_foreign_key "courses", "instances", name: "fk_courses_instance_id"
  add_foreign_key "courses", "users", column: "creator_id", name: "fk_courses_creator_id"
  add_foreign_key "courses", "users", column: "updater_id", name: "fk_courses_updater_id"
  add_foreign_key "generic_announcements", "instances", name: "fk_generic_announcements_instance_id"
  add_foreign_key "generic_announcements", "users", column: "creator_id", name: "fk_generic_announcements_creator_id"
  add_foreign_key "generic_announcements", "users", column: "updater_id", name: "fk_generic_announcements_updater_id"
  add_foreign_key "instance_user_role_requests", "instances", name: "fk_instance_user_role_requests_instance_id"
  add_foreign_key "instance_user_role_requests", "users", name: "fk_instance_user_role_requests_user_id"
  add_foreign_key "instance_users", "instances", name: "fk_instance_users_instance_id"
  add_foreign_key "instance_users", "users", name: "fk_instance_users_user_id"
  add_foreign_key "polyglot_languages", "polyglot_languages", column: "parent_id", name: "fk_polyglot_languages_parent_id"
  add_foreign_key "user_emails", "users", name: "fk_user_emails_user_id"
  add_foreign_key "user_identities", "users", name: "fk_user_identities_user_id"
  add_foreign_key "user_notifications", "users", name: "fk_user_notifications_user_id"
end
