# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_10_16_104515) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "activities", id: :serial, force: :cascade do |t|
    t.integer "actor_id", null: false
    t.integer "object_id", null: false
    t.string "object_type", limit: 255, null: false
    t.string "event", limit: 255, null: false
    t.string "notifier_type", limit: 255, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["actor_id"], name: "fk__activities_actor_id"
  end

  create_table "attachment_references", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.integer "attachable_id"
    t.string "attachable_type", limit: 255
    t.integer "attachment_id", null: false
    t.string "name", limit: 255, null: false
    t.datetime "expires_at", precision: nil
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["attachable_type", "attachable_id"], name: "fk__attachment_references_attachable_id"
    t.index ["attachment_id"], name: "fk__attachment_references_attachment_id"
    t.index ["creator_id"], name: "fk__attachment_references_creator_id"
    t.index ["updater_id"], name: "fk__attachment_references_updater_id"
  end

  create_table "attachments", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.text "file_upload", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["name"], name: "index_attachments_on_name", unique: true
  end

  create_table "cikgo_users", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "provided_user_id", null: false
    t.index ["user_id"], name: "index_cikgo_users_on_user_id"
  end

  create_table "course_achievements", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.text "badge"
    t.integer "weight", null: false
    t.boolean "published", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "satisfiability_type", default: 0
    t.index ["course_id"], name: "fk__course_achievements_course_id"
    t.index ["creator_id"], name: "fk__course_achievements_creator_id"
    t.index ["updater_id"], name: "fk__course_achievements_updater_id"
  end

  create_table "course_announcements", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "content"
    t.boolean "sticky", default: false, null: false
    t.datetime "start_at", precision: nil, null: false
    t.datetime "end_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.float "opening_reminder_token"
    t.index ["course_id"], name: "fk__course_announcements_course_id"
    t.index ["creator_id"], name: "fk__course_announcements_creator_id"
    t.index ["updater_id"], name: "fk__course_announcements_updater_id"
  end

  create_table "course_assessment_answer_auto_gradings", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "answer_id", null: false
    t.uuid "job_id"
    t.json "result"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["actable_id", "actable_type"], name: "index_course_assessment_answer_auto_gradings_on_actable", unique: true
    t.index ["answer_id"], name: "index_course_assessment_answer_auto_gradings_on_answer_id", unique: true
    t.index ["job_id"], name: "index_course_assessment_answer_auto_gradings_on_job_id", unique: true
  end

  create_table "course_assessment_answer_forum_post_responses", force: :cascade do |t|
    t.text "answer_text"
  end

  create_table "course_assessment_answer_forum_posts", force: :cascade do |t|
    t.bigint "answer_id", null: false
    t.integer "forum_topic_id", null: false
    t.integer "post_id", null: false
    t.string "post_text", null: false
    t.integer "post_creator_id", null: false
    t.datetime "post_updated_at", precision: nil, null: false
    t.integer "parent_id"
    t.string "parent_text"
    t.integer "parent_creator_id"
    t.datetime "parent_updated_at", precision: nil
    t.index ["answer_id"], name: "index_course_assessment_answer_forum_posts_on_answer_id"
  end

  create_table "course_assessment_answer_multiple_response_options", id: :serial, force: :cascade do |t|
    t.integer "answer_id", null: false
    t.integer "option_id", null: false
    t.index ["answer_id", "option_id"], name: "index_multiple_response_answer_on_answer_id_and_option_id", unique: true
    t.index ["answer_id"], name: "fk__course_assessment_multiple_response_option_answer"
    t.index ["option_id"], name: "fk__course_assessment_multiple_response_option_question_option"
  end

  create_table "course_assessment_answer_multiple_responses", id: :serial, force: :cascade do |t|
    t.decimal "random_seed"
  end

  create_table "course_assessment_answer_programming", id: :serial, force: :cascade do |t|
    t.uuid "codaveri_feedback_job_id", comment: "The ID of the codaveri code feedback job"
  end

  create_table "course_assessment_answer_programming_auto_gradings", id: :serial, force: :cascade do |t|
    t.text "stdout"
    t.text "stderr"
    t.integer "exit_code"
  end

  create_table "course_assessment_answer_programming_file_annotations", id: :serial, force: :cascade do |t|
    t.integer "file_id", null: false
    t.integer "line", null: false
    t.index ["file_id"], name: "fk__course_assessment_answe_09c4b638af92d0f8252d7cdef59bd6f3"
  end

  create_table "course_assessment_answer_programming_files", id: :serial, force: :cascade do |t|
    t.integer "answer_id", null: false
    t.string "filename", limit: 255, null: false
    t.text "content", default: "", null: false
    t.index "answer_id, lower((filename)::text)", name: "index_course_assessment_answer_programming_files_filename", unique: true
    t.index ["answer_id"], name: "fk__course_assessment_answer_programming_files_answer_id"
  end

  create_table "course_assessment_answer_programming_test_results", id: :serial, force: :cascade do |t|
    t.integer "auto_grading_id", null: false
    t.integer "test_case_id"
    t.boolean "passed", null: false
    t.jsonb "messages", default: {}, null: false
    t.index ["auto_grading_id"], name: "fk__course_assessment_answe_3d4bf9a99ed787551e4454c7106971fc"
    t.index ["test_case_id"], name: "fk__course_assessment_answe_ca0d5ba368869806d2a9cb8717feed4f"
  end

  create_table "course_assessment_answer_scribing_scribbles", id: :serial, force: :cascade do |t|
    t.text "content"
    t.integer "answer_id", null: false
    t.integer "creator_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["answer_id"], name: "fk__course_assessment_answer_scribing_scribbles_scribing_answer"
    t.index ["creator_id"], name: "fk__course_assessment_answer_scribing_scribbles_creator_id"
  end

  create_table "course_assessment_answer_scribings", id: :serial, force: :cascade do |t|
  end

  create_table "course_assessment_answer_text_responses", id: :serial, force: :cascade do |t|
    t.text "answer_text"
  end

  create_table "course_assessment_answer_voice_responses", id: :serial, force: :cascade do |t|
  end

  create_table "course_assessment_answers", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "submission_id", null: false
    t.integer "question_id", null: false
    t.string "workflow_state", limit: 255, null: false
    t.datetime "submitted_at", precision: nil
    t.decimal "grade", precision: 4, scale: 1
    t.boolean "correct"
    t.integer "grader_id"
    t.datetime "graded_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "current_answer", default: false, null: false
    t.string "last_session_id"
    t.bigint "client_version"
    t.index ["actable_type", "actable_id"], name: "index_course_assessment_answers_actable", unique: true
    t.index ["grader_id"], name: "fk__course_assessment_answers_grader_id"
    t.index ["question_id"], name: "fk__course_assessment_answers_question_id"
    t.index ["submission_id"], name: "fk__course_assessment_answers_submission_id"
  end

  create_table "course_assessment_categories", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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

  create_table "course_assessment_question_forum_post_responses", force: :cascade do |t|
    t.boolean "has_text_response", default: false
    t.integer "max_posts", limit: 2, null: false
  end

  create_table "course_assessment_question_groups", force: :cascade do |t|
    t.string "title", null: false
    t.bigint "assessment_id", null: false
    t.integer "weight", null: false
    t.index ["assessment_id"], name: "index_course_assessment_question_groups_on_assessment_id"
  end

  create_table "course_assessment_question_multiple_response_options", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.boolean "correct", null: false
    t.text "option", null: false
    t.text "explanation"
    t.integer "weight", null: false
    t.boolean "ignore_randomization", default: false
    t.index ["question_id"], name: "fk__course_assessment_multiple_response_option_question"
  end

  create_table "course_assessment_question_multiple_responses", id: :serial, force: :cascade do |t|
    t.integer "grading_scheme", default: 0, null: false
    t.boolean "randomize_options", default: false
    t.boolean "skip_grading", default: false
  end

  create_table "course_assessment_question_programming", id: :serial, force: :cascade do |t|
    t.integer "language_id", null: false
    t.integer "memory_limit"
    t.integer "time_limit"
    t.uuid "import_job_id"
    t.integer "attempt_limit"
    t.integer "package_type", default: 0, null: false
    t.boolean "multiple_file_submission", default: false, null: false
    t.boolean "is_codaveri", default: false
    t.text "codaveri_id"
    t.integer "codaveri_status"
    t.text "codaveri_message"
    t.boolean "live_feedback_enabled", default: false, null: false
    t.string "live_feedback_custom_prompt", default: "", null: false
    t.index ["import_job_id"], name: "index_course_assessment_question_programming_on_import_job_id", unique: true
    t.index ["language_id"], name: "fk__course_assessment_question_programming_language_id"
  end

  create_table "course_assessment_question_programming_template_files", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.string "filename", limit: 255, null: false
    t.text "content", null: false
    t.index "question_id, lower((filename)::text)", name: "index_course_assessment_question_programming_template_filenames", unique: true
    t.index ["question_id"], name: "fk__course_assessment_quest_dbf3aed51f19fcc63a25d296a057dd1f"
  end

  create_table "course_assessment_question_programming_test_cases", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.string "identifier", limit: 255, null: false
    t.integer "test_case_type", null: false
    t.text "expression"
    t.text "expected"
    t.text "hint"
    t.index ["identifier", "question_id"], name: "index_course_assessment_question_programming_test_case_ident", unique: true
    t.index ["question_id"], name: "fk__course_assessment_quest_18b37224652fc59d955122a17ba20d07"
  end

  create_table "course_assessment_question_scribings", id: :serial, force: :cascade do |t|
  end

  create_table "course_assessment_question_text_response_compre_groups", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.decimal "maximum_group_grade", precision: 4, scale: 1, default: "0.0", null: false
    t.index ["question_id"], name: "fk__course_assessment_text_response_compre_group_question"
  end

  create_table "course_assessment_question_text_response_compre_points", id: :serial, force: :cascade do |t|
    t.integer "group_id", null: false
    t.decimal "point_grade", precision: 4, scale: 1, default: "0.0", null: false
    t.index ["group_id"], name: "fk__course_assessment_text_response_compre_point_group"
  end

  create_table "course_assessment_question_text_response_compre_solutions", id: :serial, force: :cascade do |t|
    t.integer "point_id", null: false
    t.integer "solution_type", default: 0, null: false
    t.string "solution", default: [], null: false, array: true
    t.string "solution_lemma", default: [], null: false, array: true
    t.string "information"
    t.index ["point_id"], name: "fk__course_assessment_text_response_compre_solution_point"
  end

  create_table "course_assessment_question_text_response_solutions", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.integer "solution_type", default: 0, null: false
    t.text "solution", null: false
    t.decimal "grade", precision: 4, scale: 1, default: "0.0", null: false
    t.text "explanation"
    t.index ["question_id"], name: "fk__course_assessment_text_response_solution_question"
  end

  create_table "course_assessment_question_text_responses", id: :serial, force: :cascade do |t|
    t.boolean "hide_text", default: false
    t.boolean "is_comprehension", default: false
    t.boolean "is_attachment_required", default: false, null: false
    t.integer "max_attachments", default: 0, null: false
    t.integer "max_attachment_size"
  end

  create_table "course_assessment_question_voice_responses", id: :serial, force: :cascade do |t|
  end

  create_table "course_assessment_questions", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.string "title", limit: 255
    t.text "description"
    t.text "staff_only_comments"
    t.decimal "maximum_grade", precision: 4, scale: 1, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "is_low_priority", default: false
    t.string "koditsu_question_id"
    t.boolean "is_synced_with_koditsu", default: false, null: false
    t.index ["actable_type", "actable_id"], name: "index_course_assessment_questions_actable", unique: true
    t.index ["creator_id"], name: "fk__course_assessment_questions_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_questions_updater_id"
  end

  create_table "course_assessment_skill_branches", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["course_id"], name: "fk__course_assessment_skill_branches_course_id"
    t.index ["creator_id"], name: "fk__course_assessment_skill_branches_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_skill_branches_updater_id"
  end

  create_table "course_assessment_skills", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "skill_branch_id"
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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

  create_table "course_assessment_submission_logs", id: :serial, force: :cascade do |t|
    t.integer "submission_id", null: false
    t.jsonb "request"
    t.datetime "created_at", precision: nil, null: false
    t.index ["submission_id"], name: "fk__course_assessment_submission_logs_submission_id"
  end

  create_table "course_assessment_submission_questions", id: :serial, force: :cascade do |t|
    t.integer "submission_id", null: false
    t.integer "question_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["question_id"], name: "fk__course_assessment_submission_questions_question_id"
    t.index ["submission_id", "question_id"], name: "idx_course_assessment_submission_questions_on_sub_and_qn", unique: true
    t.index ["submission_id"], name: "fk__course_assessment_submission_questions_submission_id"
  end

  create_table "course_assessment_submissions", id: :serial, force: :cascade do |t|
    t.integer "assessment_id", null: false
    t.string "workflow_state", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "publisher_id"
    t.datetime "published_at", precision: nil
    t.string "session_id", limit: 255
    t.datetime "submitted_at", precision: nil
    t.datetime "last_graded_time", precision: nil, default: "2021-10-24 14:11:56"
    t.index ["assessment_id", "creator_id"], name: "unique_assessment_id_and_creator_id", unique: true
    t.index ["assessment_id"], name: "fk__course_assessment_submissions_assessment_id"
    t.index ["creator_id"], name: "fk__course_assessment_submissions_creator_id"
    t.index ["publisher_id"], name: "fk__course_assessment_submissions_publisher_id"
    t.index ["updater_id"], name: "fk__course_assessment_submissions_updater_id"
  end

  create_table "course_assessment_tabs", id: :serial, force: :cascade do |t|
    t.integer "category_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["category_id"], name: "fk__course_assessment_tabs_category_id"
    t.index ["creator_id"], name: "fk__course_assessment_tabs_creator_id"
    t.index ["updater_id"], name: "fk__course_assessment_tabs_updater_id"
  end

  create_table "course_assessments", id: :serial, force: :cascade do |t|
    t.integer "tab_id", null: false
    t.boolean "autograded", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "session_password", limit: 255
    t.boolean "tabbed_view", default: false, null: false
    t.boolean "skippable", default: false
    t.boolean "delayed_grade_publication", default: false
    t.boolean "show_private", default: false
    t.boolean "show_evaluation", default: false
    t.string "view_password", limit: 255
    t.boolean "use_public", default: true
    t.boolean "use_private", default: true
    t.boolean "use_evaluation", default: false
    t.boolean "allow_partial_submission", default: false
    t.integer "randomization"
    t.boolean "show_mcq_answer", default: true
    t.boolean "show_mcq_mrq_solution", default: true
    t.boolean "block_student_viewing_after_submitted", default: false
    t.integer "satisfiability_type", default: 0
    t.bigint "monitor_id"
    t.boolean "allow_record_draft_answer", default: false
    t.integer "time_limit"
    t.string "koditsu_assessment_id"
    t.boolean "is_koditsu_enabled"
    t.boolean "is_synced_with_koditsu", default: false, null: false
    t.index ["creator_id"], name: "fk__course_assessments_creator_id"
    t.index ["monitor_id"], name: "index_course_assessments_on_monitor_id"
    t.index ["tab_id"], name: "fk__course_assessments_tab_id"
    t.index ["updater_id"], name: "fk__course_assessments_updater_id"
  end

  create_table "course_condition_achievements", id: :serial, force: :cascade do |t|
    t.integer "achievement_id", null: false
    t.index ["achievement_id"], name: "fk__course_condition_achievements_achievement_id"
  end

  create_table "course_condition_assessments", id: :serial, force: :cascade do |t|
    t.integer "assessment_id", null: false
    t.float "minimum_grade_percentage"
    t.index ["assessment_id"], name: "fk__course_condition_assessments_assessment_id"
  end

  create_table "course_condition_levels", id: :serial, force: :cascade do |t|
    t.integer "minimum_level", null: false
  end

  create_table "course_condition_surveys", id: :serial, force: :cascade do |t|
    t.bigint "survey_id", null: false
    t.index ["survey_id"], name: "fk__course_condition_surveys_survey_id"
  end

  create_table "course_condition_videos", force: :cascade do |t|
    t.bigint "video_id", null: false
    t.float "minimum_watch_percentage"
    t.index ["video_id"], name: "fk__course_condition_videos_video_id"
  end

  create_table "course_conditions", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.integer "conditional_id", null: false
    t.string "conditional_type", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["actable_type", "actable_id"], name: "index_course_conditions_on_actable_type_and_actable_id", unique: true
    t.index ["conditional_type", "conditional_id"], name: "index_course_conditions_on_conditional_type_and_conditional_id"
    t.index ["course_id"], name: "fk__course_conditions_course_id"
    t.index ["creator_id"], name: "fk__course_conditions_creator_id"
    t.index ["updater_id"], name: "fk__course_conditions_updater_id"
  end

  create_table "course_discussion_post_codaveri_feedbacks", force: :cascade do |t|
    t.bigint "post_id", null: false
    t.integer "status"
    t.text "codaveri_feedback_id", null: false
    t.text "original_feedback", null: false
    t.integer "rating"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "fk__codaveri_feedback_discussion_post_id", unique: true
    t.index ["status"], name: "index_course_discussion_post_codaveri_feedbacks_on_status"
  end

  create_table "course_discussion_post_votes", id: :serial, force: :cascade do |t|
    t.integer "post_id", null: false
    t.boolean "vote_flag", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["creator_id"], name: "fk__course_discussion_post_votes_creator_id"
    t.index ["post_id", "creator_id"], name: "index_course_discussion_post_votes_on_post_id_and_creator_id", unique: true
    t.index ["post_id"], name: "fk__course_discussion_post_votes_post_id"
    t.index ["updater_id"], name: "fk__course_discussion_post_votes_updater_id"
  end

  create_table "course_discussion_posts", id: :serial, force: :cascade do |t|
    t.integer "parent_id"
    t.integer "topic_id", null: false
    t.string "title", limit: 255
    t.text "text"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "answer", default: false
    t.boolean "is_delayed", default: false, null: false
    t.string "workflow_state", default: "published"
    t.boolean "is_anonymous", default: false, null: false
    t.index ["creator_id"], name: "fk__course_discussion_posts_creator_id"
    t.index ["parent_id"], name: "fk__course_discussion_posts_parent_id"
    t.index ["topic_id"], name: "fk__course_discussion_posts_topic_id"
    t.index ["updater_id"], name: "fk__course_discussion_posts_updater_id"
    t.index ["workflow_state"], name: "index_course_discussion_posts_on_workflow_state"
  end

  create_table "course_discussion_topic_subscriptions", id: :serial, force: :cascade do |t|
    t.integer "topic_id", null: false
    t.integer "user_id", null: false
    t.index ["topic_id", "user_id"], name: "index_topic_subscriptions_on_topic_id_and_user_id", unique: true
    t.index ["topic_id"], name: "fk__course_discussion_topic_subscriptions_topic_id"
    t.index ["user_id"], name: "fk__course_discussion_topic_subscriptions_user_id"
  end

  create_table "course_discussion_topics", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.boolean "pending_staff_reply", default: false, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["actable_type", "actable_id"], name: "index_course_discussion_topics_on_actable_type_and_actable_id", unique: true
    t.index ["course_id"], name: "fk__course_discussion_topics_course_id"
  end

  create_table "course_enrol_requests", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.bigint "creator_id", null: false
    t.bigint "updater_id", null: false
    t.string "workflow_state", null: false
    t.datetime "confirmed_at", precision: nil
    t.bigint "confirmer_id"
    t.index ["confirmer_id"], name: "index_course_enrol_requests_on_confirmer_id"
    t.index ["course_id", "user_id"], name: "index_course_enrol_requests_on_course_id_and_user_id"
    t.index ["course_id"], name: "fk__course_enrol_requests_course_id"
    t.index ["creator_id"], name: "index_course_enrol_requests_on_creator_id"
    t.index ["updater_id"], name: "index_course_enrol_requests_on_updater_id"
    t.index ["user_id"], name: "fk__course_enrol_requests_user_id"
  end

  create_table "course_experience_points_records", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "points_awarded"
    t.integer "course_user_id", null: false
    t.string "reason", limit: 255
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "draft_points_awarded"
    t.datetime "awarded_at", precision: nil
    t.integer "awarder_id"
    t.datetime "deleted_at"
    t.index ["actable_type", "actable_id"], name: "index_course_experience_points_records_on_actable", unique: true
    t.index ["awarder_id"], name: "fk__course_experience_points_records_awarder_id"
    t.index ["course_user_id"], name: "fk__course_experience_points_records_course_user_id"
    t.index ["creator_id"], name: "fk__course_experience_points_records_creator_id"
    t.index ["deleted_at"], name: "index_course_experience_points_records_on_deleted_at"
    t.index ["updater_id"], name: "fk__course_experience_points_records_updater_id"
  end

  create_table "course_forum_subscriptions", id: :serial, force: :cascade do |t|
    t.integer "forum_id", null: false
    t.integer "user_id", null: false
    t.index ["forum_id", "user_id"], name: "index_course_forum_subscriptions_on_forum_id_and_user_id", unique: true
    t.index ["forum_id"], name: "fk__course_forum_subscriptions_forum_id"
    t.index ["user_id"], name: "fk__course_forum_subscriptions_user_id"
  end

  create_table "course_forum_topic_views", id: :serial, force: :cascade do |t|
    t.integer "topic_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["topic_id"], name: "fk__course_forum_topic_views_topic_id"
    t.index ["user_id"], name: "fk__course_forum_topic_views_user_id"
  end

  create_table "course_forum_topics", id: :serial, force: :cascade do |t|
    t.integer "forum_id", null: false
    t.string "title", limit: 255, null: false
    t.string "slug", limit: 255
    t.boolean "locked", default: false
    t.boolean "hidden", default: false
    t.integer "topic_type", default: 0
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "resolved", default: false, null: false
    t.datetime "latest_post_at", precision: nil, null: false
    t.index ["creator_id"], name: "fk__course_forum_topics_creator_id"
    t.index ["forum_id", "slug"], name: "index_course_forum_topics_on_forum_id_and_slug", unique: true
    t.index ["forum_id"], name: "fk__course_forum_topics_forum_id"
    t.index ["updater_id"], name: "fk__course_forum_topics_updater_id"
  end

  create_table "course_forums", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "name", limit: 255, null: false
    t.string "slug", limit: 255
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "forum_topics_auto_subscribe", default: true, null: false
    t.index ["course_id", "slug"], name: "index_course_forums_on_course_id_and_slug", unique: true
    t.index ["course_id"], name: "fk__course_forums_course_id"
    t.index ["creator_id"], name: "fk__course_forums_creator_id"
    t.index ["updater_id"], name: "fk__course_forums_updater_id"
  end

  create_table "course_group_categories", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.string "name", default: "", null: false
    t.text "description"
    t.bigint "creator_id", null: false
    t.bigint "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id", "name"], name: "index_course_group_categories_on_course_id_and_name", unique: true
    t.index ["course_id"], name: "fk__course_group_categories_course_id"
    t.index ["creator_id"], name: "fk__course_group_categories_creator_id"
    t.index ["updater_id"], name: "fk__course_group_categories_updater_id"
  end

  create_table "course_group_users", id: :serial, force: :cascade do |t|
    t.integer "group_id", null: false
    t.integer "course_user_id", null: false
    t.integer "role", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "deleted_at"
    t.index ["course_user_id", "group_id"], name: "index_course_group_users_on_course_user_id_and_course_group_id", unique: true
    t.index ["course_user_id"], name: "fk__course_group_users_course_user_id"
    t.index ["creator_id"], name: "fk__course_group_users_creator_id"
    t.index ["deleted_at"], name: "index_course_group_users_on_deleted_at"
    t.index ["group_id"], name: "fk__course_group_users_course_group_id"
    t.index ["updater_id"], name: "fk__course_group_users_updater_id"
  end

  create_table "course_groups", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.text "description"
    t.bigint "group_category_id", null: false
    t.index ["creator_id"], name: "fk__course_groups_creator_id"
    t.index ["group_category_id", "name"], name: "index_course_groups_on_group_category_id_and_name", unique: true
    t.index ["group_category_id"], name: "fk__course_groups_group_category_id"
    t.index ["updater_id"], name: "fk__course_groups_updater_id"
  end

  create_table "course_learning_maps", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "fk__course_learning_maps_course_id"
  end

  create_table "course_learning_rate_records", force: :cascade do |t|
    t.bigint "course_user_id", null: false
    t.float "learning_rate", null: false
    t.float "effective_min", null: false
    t.float "effective_max", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.index ["course_user_id"], name: "fk__course_learning_rate_records_course_user_id"
    t.index ["deleted_at"], name: "index_course_learning_rate_records_on_deleted_at"
  end

  create_table "course_lesson_plan_event_materials", id: :serial, force: :cascade do |t|
    t.integer "lesson_plan_event_id", null: false
    t.integer "material_id", null: false
    t.index ["lesson_plan_event_id"], name: "fk__course_lesson_plan_event_materials_lesson_plan_event_id"
    t.index ["material_id"], name: "fk__course_lesson_plan_event_materials_material_id"
  end

  create_table "course_lesson_plan_events", id: :serial, force: :cascade do |t|
    t.string "location", limit: 255
    t.string "event_type", limit: 255, null: false
  end

  create_table "course_lesson_plan_items", id: :serial, force: :cascade do |t|
    t.integer "actable_id"
    t.string "actable_type", limit: 255
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.boolean "published", default: false, null: false
    t.integer "base_exp", null: false
    t.integer "time_bonus_exp", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.float "closing_reminder_token"
    t.boolean "triggers_recomputation", default: false, null: false
    t.boolean "movable", default: false, null: false
    t.boolean "has_personal_times", default: false, null: false
    t.boolean "affects_personal_times", default: false, null: false
    t.boolean "has_todo"
    t.index ["actable_type", "actable_id"], name: "index_course_lesson_plan_items_on_actable_type_and_actable_id", unique: true
    t.index ["course_id"], name: "fk__course_lesson_plan_items_course_id"
    t.index ["creator_id"], name: "fk__course_lesson_plan_items_creator_id"
    t.index ["updater_id"], name: "fk__course_lesson_plan_items_updater_id"
  end

  create_table "course_lesson_plan_milestones", id: :serial, force: :cascade do |t|
  end

  create_table "course_lesson_plan_todos", id: :serial, force: :cascade do |t|
    t.integer "item_id", null: false
    t.integer "user_id", null: false
    t.string "workflow_state", limit: 255, null: false
    t.boolean "ignore", default: false, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["creator_id"], name: "fk__course_lesson_plan_todos_creator_id"
    t.index ["item_id", "user_id"], name: "index_course_lesson_plan_todos_on_item_id_and_user_id", unique: true
    t.index ["item_id"], name: "fk__course_lesson_plan_todos_item_id"
    t.index ["updater_id"], name: "fk__course_lesson_plan_todos_updater_id"
    t.index ["user_id"], name: "fk__course_lesson_plan_todos_user_id"
  end

  create_table "course_levels", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "experience_points_threshold", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["course_id", "experience_points_threshold"], name: "index_experience_points_threshold_on_course_id", unique: true
    t.index ["course_id"], name: "fk__course_levels_course_id"
  end

  create_table "course_material_folders", id: :serial, force: :cascade do |t|
    t.integer "parent_id"
    t.integer "course_id", null: false
    t.integer "owner_id"
    t.string "owner_type", limit: 255
    t.string "name", limit: 255, null: false
    t.text "description"
    t.boolean "can_student_upload", default: false, null: false
    t.datetime "start_at", precision: nil, null: false
    t.datetime "end_at", precision: nil
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index "parent_id, lower((name)::text)", name: "index_course_material_folders_on_parent_id_and_name", unique: true
    t.index ["course_id"], name: "fk__course_material_folders_course_id"
    t.index ["creator_id"], name: "fk__course_material_folders_creator_id"
    t.index ["owner_id", "owner_type"], name: "index_course_material_folders_on_owner_id_and_owner_type", unique: true
    t.index ["owner_type", "owner_id"], name: "fk__course_material_folders_owner_id"
    t.index ["parent_id"], name: "fk__course_material_folders_parent_id"
    t.index ["updater_id"], name: "fk__course_material_folders_updater_id"
  end

  create_table "course_materials", id: :serial, force: :cascade do |t|
    t.integer "folder_id", null: false
    t.string "name", limit: 255, null: false
    t.text "description"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index "folder_id, lower((name)::text)", name: "index_course_materials_on_folder_id_and_name", unique: true
    t.index ["creator_id"], name: "fk__course_materials_creator_id"
    t.index ["folder_id"], name: "fk__course_materials_folder_id"
    t.index ["updater_id"], name: "fk__course_materials_updater_id"
  end

  create_table "course_monitoring_heartbeats", force: :cascade do |t|
    t.bigint "session_id", null: false
    t.string "user_agent", null: false
    t.string "ip_address"
    t.datetime "generated_at", precision: nil, null: false
    t.boolean "stale", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "seb_payload"
    t.index ["generated_at"], name: "index_course_monitoring_heartbeats_on_generated_at"
    t.index ["session_id"], name: "index_course_monitoring_heartbeats_on_session_id"
  end

  create_table "course_monitoring_monitors", force: :cascade do |t|
    t.boolean "enabled", default: false, null: false
    t.string "secret"
    t.integer "min_interval_ms", null: false
    t.integer "max_interval_ms", null: false
    t.integer "offset_ms", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "blocks", default: false, null: false
    t.boolean "browser_authorization", default: true, null: false
    t.integer "browser_authorization_method", default: 0, null: false
    t.string "seb_config_key"
  end

  create_table "course_monitoring_sessions", force: :cascade do |t|
    t.bigint "monitor_id", null: false
    t.integer "status", default: 0, null: false
    t.bigint "creator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "misses", default: 0, null: false
    t.index ["creator_id"], name: "fk__course_monitoring_sessions_creator_id"
    t.index ["monitor_id"], name: "index_course_monitoring_sessions_on_monitor_id"
  end

  create_table "course_notifications", id: :serial, force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "course_id", null: false
    t.integer "notification_type", default: 0, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["activity_id"], name: "index_course_notifications_on_activity_id"
    t.index ["course_id"], name: "index_course_notifications_on_course_id"
  end

  create_table "course_personal_times", force: :cascade do |t|
    t.bigint "course_user_id", null: false
    t.bigint "lesson_plan_item_id", null: false
    t.datetime "start_at", precision: nil, null: false
    t.datetime "bonus_end_at", precision: nil
    t.datetime "end_at", precision: nil
    t.boolean "fixed", default: false, null: false
    t.datetime "deleted_at"
    t.index ["course_user_id"], name: "index_course_personal_times_on_course_user_id"
    t.index ["deleted_at"], name: "index_course_personal_times_on_deleted_at"
    t.index ["lesson_plan_item_id"], name: "index_course_personal_times_on_lesson_plan_item_id"
  end

  create_table "course_question_assessments", id: :serial, force: :cascade do |t|
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "title"
    t.integer "weight"
    t.index ["course_id"], name: "index_course_reference_timelines_on_course_id"
  end

  create_table "course_reference_times", force: :cascade do |t|
    t.bigint "reference_timeline_id", null: false
    t.bigint "lesson_plan_item_id", null: false
    t.datetime "start_at", precision: nil, null: false
    t.datetime "bonus_end_at", precision: nil
    t.datetime "end_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["lesson_plan_item_id"], name: "index_course_reference_times_on_lesson_plan_item_id"
    t.index ["reference_timeline_id"], name: "index_course_reference_times_on_reference_timeline_id"
  end

  create_table "course_settings_emails", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.integer "component", null: false
    t.bigint "course_assessment_category_id"
    t.integer "setting", null: false
    t.boolean "phantom", default: true, null: false
    t.boolean "regular", default: true, null: false
    t.index ["course_assessment_category_id"], name: "index_course_settings_emails_on_course_assessment_category_id"
    t.index ["course_id", "component", "course_assessment_category_id", "setting"], name: "index_course_settings_emails_composite", unique: true
    t.index ["course_id"], name: "index_course_settings_emails_on_course_id"
  end

  create_table "course_survey_answer_options", id: :serial, force: :cascade do |t|
    t.integer "answer_id", null: false
    t.integer "question_option_id", null: false
    t.index ["answer_id"], name: "fk__course_survey_answer_options_answer_id"
    t.index ["question_option_id"], name: "fk__course_survey_answer_options_question_option_id"
  end

  create_table "course_survey_answers", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.integer "response_id", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.text "text_response"
    t.index ["creator_id"], name: "fk__course_survey_answers_creator_id"
    t.index ["question_id"], name: "fk__course_survey_answers_question_id"
    t.index ["response_id"], name: "fk__course_survey_answers_response_id"
    t.index ["updater_id"], name: "fk__course_survey_answers_updater_id"
  end

  create_table "course_survey_question_options", id: :serial, force: :cascade do |t|
    t.integer "question_id", null: false
    t.text "option"
    t.integer "weight", null: false
    t.index ["question_id"], name: "fk__course_survey_question_options_question_id"
  end

  create_table "course_survey_questions", id: :serial, force: :cascade do |t|
    t.text "description", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "required", default: false, null: false
    t.integer "question_type", default: 0, null: false
    t.integer "weight", null: false
    t.integer "max_options"
    t.integer "min_options"
    t.boolean "grid_view", default: false, null: false
    t.integer "section_id", null: false
    t.index ["creator_id"], name: "fk__course_survey_questions_creator_id"
    t.index ["section_id"], name: "index_course_survey_questions_on_section_id"
    t.index ["updater_id"], name: "fk__course_survey_questions_updater_id"
  end

  create_table "course_survey_responses", id: :serial, force: :cascade do |t|
    t.integer "survey_id", null: false
    t.datetime "submitted_at", precision: nil
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["creator_id"], name: "fk__course_survey_responses_creator_id"
    t.index ["survey_id", "creator_id"], name: "index_course_survey_responses_on_survey_id_and_creator_id", unique: true
    t.index ["survey_id"], name: "fk__course_survey_responses_survey_id"
    t.index ["updater_id"], name: "fk__course_survey_responses_updater_id"
  end

  create_table "course_survey_sections", id: :serial, force: :cascade do |t|
    t.integer "survey_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.integer "weight", null: false
    t.index ["survey_id"], name: "fk__course_survey_sections_survey_id"
  end

  create_table "course_surveys", id: :serial, force: :cascade do |t|
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "anonymous", default: false, null: false
    t.boolean "allow_modify_after_submit", default: false, null: false
    t.datetime "closing_reminded_at", precision: nil
    t.boolean "allow_response_after_end", default: false, null: false
    t.integer "satisfiability_type", default: 0
    t.index ["creator_id"], name: "fk__course_surveys_creator_id"
    t.index ["updater_id"], name: "fk__course_surveys_updater_id"
  end

  create_table "course_user_achievements", id: :serial, force: :cascade do |t|
    t.integer "course_user_id"
    t.integer "achievement_id"
    t.datetime "obtained_at", precision: nil, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "deleted_at"
    t.index ["achievement_id"], name: "fk__course_user_achievements_achievement_id"
    t.index ["course_user_id", "achievement_id"], name: "index_user_achievements_on_course_user_id_and_achievement_id", unique: true
    t.index ["course_user_id"], name: "fk__course_user_achievements_course_user_id"
    t.index ["deleted_at"], name: "index_course_user_achievements_on_deleted_at"
  end

  create_table "course_user_email_unsubscriptions", force: :cascade do |t|
    t.bigint "course_user_id", null: false
    t.bigint "course_settings_email_id", null: false
    t.datetime "deleted_at"
    t.index ["course_settings_email_id"], name: "index_email_unsubscriptions_on_course_settings_email_id"
    t.index ["course_user_id", "course_settings_email_id"], name: "index_course_user_email_unsubscriptions_composite", unique: true
    t.index ["course_user_id"], name: "index_email_unsubscriptions_on_course_user_id"
    t.index ["deleted_at"], name: "index_course_user_email_unsubscriptions_on_deleted_at"
  end

  create_table "course_user_invitations", id: :serial, force: :cascade do |t|
    t.string "invitation_key", limit: 32, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "sent_at", precision: nil
    t.integer "course_id", null: false
    t.string "name", limit: 255, null: false
    t.string "email", limit: 255, null: false
    t.datetime "confirmed_at", precision: nil
    t.integer "confirmer_id"
    t.integer "role", default: 0, null: false
    t.boolean "phantom", default: false, null: false
    t.integer "timeline_algorithm"
    t.index "lower((email)::text)", name: "index_course_user_invitations_on_email"
    t.index ["confirmer_id"], name: "fk__course_user_invitations_confirmer_id"
    t.index ["course_id", "email"], name: "index_course_user_invitations_on_course_id_and_email", unique: true
    t.index ["course_id"], name: "fk__course_user_invitations_course_id"
    t.index ["creator_id"], name: "fk__course_user_invitations_creator_id"
    t.index ["invitation_key"], name: "index_course_user_invitations_on_invitation_key", unique: true
    t.index ["updater_id"], name: "fk__course_user_invitations_updater_id"
  end

  create_table "course_users", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.integer "user_id", null: false
    t.integer "role", default: 0, null: false
    t.string "name", limit: 255, null: false
    t.boolean "phantom", default: false, null: false
    t.datetime "last_active_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.bigint "reference_timeline_id"
    t.integer "timeline_algorithm", default: 0, null: false
    t.datetime "deleted_at"
    t.index ["course_id", "user_id"], name: "index_course_users_on_course_id_and_user_id", unique: true
    t.index ["course_id"], name: "fk__course_users_course_id"
    t.index ["creator_id"], name: "fk__course_users_creator_id"
    t.index ["deleted_at"], name: "index_course_users_on_deleted_at"
    t.index ["reference_timeline_id"], name: "index_course_users_on_reference_timeline_id"
    t.index ["updater_id"], name: "fk__course_users_updater_id"
    t.index ["user_id"], name: "fk__course_users_user_id"
  end

  create_table "course_video_events", force: :cascade do |t|
    t.integer "session_id", null: false
    t.integer "event_type", null: false
    t.integer "sequence_num", null: false
    t.integer "video_time", null: false
    t.datetime "event_time", precision: nil, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.float "playback_rate"
    t.index ["session_id", "sequence_num"], name: "index_course_video_events_on_session_id_and_sequence_num", unique: true
    t.index ["session_id"], name: "index_course_video_events_on_session_id"
  end

  create_table "course_video_sessions", force: :cascade do |t|
    t.integer "submission_id", null: false
    t.datetime "session_start", precision: nil, null: false
    t.datetime "session_end", precision: nil, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "creator_id"
    t.integer "updater_id"
    t.integer "last_video_time"
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

  create_table "course_video_submissions", id: :serial, force: :cascade do |t|
    t.integer "video_id", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["creator_id"], name: "fk__course_video_submissions_creator_id"
    t.index ["updater_id"], name: "fk__course_video_submissions_updater_id"
    t.index ["video_id", "creator_id"], name: "index_course_video_submissions_on_video_id_and_creator_id", unique: true
    t.index ["video_id"], name: "fk__course_video_submissions_video_id"
  end

  create_table "course_video_tabs", force: :cascade do |t|
    t.integer "course_id", null: false
    t.string "title", limit: 255, null: false
    t.integer "weight", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.index ["course_id"], name: "index_course_video_tabs_on_course_id"
    t.index ["creator_id"], name: "index_course_video_tabs_on_creator_id"
    t.index ["updater_id"], name: "index_course_video_tabs_on_updater_id"
  end

  create_table "course_video_topics", id: :serial, force: :cascade do |t|
    t.integer "video_id", null: false
    t.integer "timestamp", null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.index ["creator_id"], name: "index_course_video_topics_on_creator_id"
    t.index ["updater_id"], name: "index_course_video_topics_on_updater_id"
    t.index ["video_id"], name: "fk__course_video_topics_video_id"
  end

  create_table "course_videos", id: :serial, force: :cascade do |t|
    t.string "url", limit: 255, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "tab_id", null: false
    t.integer "duration", default: 0, null: false
    t.integer "satisfiability_type", default: 0
    t.index ["creator_id"], name: "fk__course_videos_creator_id"
    t.index ["tab_id"], name: "index_course_videos_on_tab_id"
    t.index ["updater_id"], name: "fk__course_videos_updater_id"
  end

  create_table "course_virtual_classrooms", id: :serial, force: :cascade do |t|
    t.integer "course_id", null: false
    t.text "instructor_classroom_link"
    t.integer "classroom_id"
    t.string "title", limit: 255, null: false
    t.text "content"
    t.datetime "start_at", precision: nil, null: false
    t.datetime "end_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "instructor_id"
    t.jsonb "recorded_videos"
    t.index ["course_id"], name: "fk__course_virtual_classrooms_course_id"
    t.index ["creator_id"], name: "fk__course_virtual_classrooms_creator_id"
    t.index ["instructor_id"], name: "index_course_virtual_classrooms_on_instructor_id"
    t.index ["updater_id"], name: "fk__course_virtual_classrooms_updater_id"
  end

  create_table "courses", id: :serial, force: :cascade do |t|
    t.integer "instance_id", null: false
    t.string "title", limit: 255, null: false
    t.text "description"
    t.text "logo"
    t.string "registration_key", limit: 16
    t.text "settings"
    t.datetime "start_at", precision: nil, null: false
    t.datetime "end_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "gamified", default: true, null: false
    t.boolean "published", default: false, null: false
    t.boolean "enrollable", default: false, null: false
    t.string "time_zone", limit: 255
    t.boolean "show_personalized_timeline_features", default: false, null: false
    t.datetime "conditional_satisfiability_evaluation_time", precision: nil, default: "2021-10-24 10:31:32"
    t.integer "default_timeline_algorithm", default: 0, null: false
    t.string "koditsu_workspace_id"
    t.index ["creator_id"], name: "fk__courses_creator_id"
    t.index ["instance_id"], name: "fk__courses_instance_id"
    t.index ["registration_key"], name: "index_courses_on_registration_key", unique: true
    t.index ["updater_id"], name: "fk__courses_updater_id"
  end

  create_table "duplication_traceable_assessments", force: :cascade do |t|
    t.bigint "assessment_id", null: false
    t.index ["assessment_id"], name: "fk__duplication_traceable_assessments_assessment_id"
  end

  create_table "duplication_traceable_courses", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.index ["course_id"], name: "fk__duplication_traceable_courses_course_id"
  end

  create_table "duplication_traceables", force: :cascade do |t|
    t.string "actable_type"
    t.bigint "actable_id"
    t.integer "source_id"
    t.bigint "creator_id", null: false
    t.bigint "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actable_type", "actable_id"], name: "index_duplication_traceables_actable", unique: true
    t.index ["creator_id"], name: "fk__duplication_traceables_creator_id"
    t.index ["updater_id"], name: "fk__duplication_traceables_updater_id"
  end

  create_table "generic_announcements", id: :serial, force: :cascade do |t|
    t.string "type", limit: 255, null: false
    t.integer "instance_id"
    t.string "title", limit: 255, null: false
    t.text "content"
    t.datetime "start_at", precision: nil, null: false
    t.datetime "end_at", precision: nil, null: false
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "sent_at", precision: nil
    t.datetime "confirmed_at", precision: nil
    t.integer "confirmer_id"
    t.integer "creator_id", null: false
    t.integer "updater_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index "lower((email)::text)", name: "index_instance_user_invitations_on_lower_email_text"
    t.index ["instance_id", "email"], name: "index_instance_user_invitations_on_instance_id_and_email", unique: true
    t.index ["instance_id"], name: "index_instance_user_invitations_on_instance_id"
    t.index ["invitation_key"], name: "index_instance_user_invitations_on_invitation_key", unique: true
  end

  create_table "instance_user_role_requests", id: :serial, force: :cascade do |t|
    t.integer "instance_id", null: false
    t.integer "user_id", null: false
    t.integer "role", null: false
    t.string "organization", limit: 255
    t.string "designation", limit: 255
    t.text "reason"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.bigint "creator_id", null: false
    t.bigint "updater_id", null: false
    t.string "workflow_state", null: false
    t.datetime "confirmed_at", precision: nil
    t.bigint "confirmer_id"
    t.text "rejection_message"
    t.index ["confirmer_id"], name: "index_instance_user_role_requests_on_confirmer_id"
    t.index ["creator_id"], name: "index_instance_user_role_requests_on_creator_id"
    t.index ["instance_id"], name: "fk__instance_user_role_requests_instance_id"
    t.index ["updater_id"], name: "index_instance_user_role_requests_on_updater_id"
    t.index ["user_id"], name: "fk__instance_user_role_requests_user_id"
  end

  create_table "instance_users", id: :serial, force: :cascade do |t|
    t.integer "instance_id", null: false
    t.integer "user_id", null: false
    t.integer "role", default: 0, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "last_active_at", precision: nil
    t.index ["instance_id", "user_id"], name: "index_instance_users_on_instance_id_and_user_id", unique: true
    t.index ["instance_id"], name: "fk__instance_users_instance_id"
  end

  create_table "instances", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "host", limit: 255, null: false
    t.text "settings"
    t.index "lower((host)::text)", name: "index_instances_on_host", unique: true
  end

  create_table "jobs", id: :uuid, default: nil, force: :cascade do |t|
    t.integer "status", default: 0, null: false
    t.text "redirect_to"
    t.json "error"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "oauth_access_grants", force: :cascade do |t|
    t.bigint "resource_owner_id", null: false
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "revoked_at", precision: nil
    t.index ["application_id"], name: "index_oauth_access_grants_on_application_id"
    t.index ["resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
  end

  create_table "oauth_access_tokens", force: :cascade do |t|
    t.bigint "resource_owner_id"
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.string "scopes"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "revoked_at", precision: nil
    t.string "previous_refresh_token", default: "", null: false
    t.index ["application_id"], name: "index_oauth_access_tokens_on_application_id"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", force: :cascade do |t|
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.boolean "confidential", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "polyglot_languages", id: :serial, force: :cascade do |t|
    t.string "type", limit: 255, null: false
    t.string "name", limit: 255, null: false
    t.integer "parent_id"
    t.serial "weight"
    t.boolean "enabled", default: true, null: false
    t.index "lower((name)::text)", name: "index_polyglot_languages_on_name", unique: true
    t.index ["parent_id"], name: "fk__polyglot_languages_parent_id"
  end

  create_table "read_marks", id: :serial, force: :cascade do |t|
    t.integer "readable_id"
    t.string "readable_type", limit: 255, null: false
    t.integer "reader_id", null: false
    t.datetime "timestamp", precision: nil
    t.string "reader_type", limit: 255
    t.index ["reader_id", "reader_type", "readable_type", "readable_id"], name: "read_marks_reader_readable_index", unique: true
    t.index ["reader_id"], name: "fk__read_marks_user_id"
  end

  create_table "user_emails", id: :serial, force: :cascade do |t|
    t.boolean "primary", default: false, null: false
    t.integer "user_id"
    t.string "email", limit: 255, null: false
    t.string "confirmation_token", limit: 255
    t.datetime "confirmed_at", precision: nil
    t.datetime "confirmation_sent_at", precision: nil
    t.string "unconfirmed_email", limit: 255
    t.index "lower((email)::text)", name: "index_user_emails_on_email", unique: true
    t.index ["confirmation_token"], name: "index_user_emails_on_confirmation_token", unique: true
    t.index ["user_id", "primary"], name: "index_user_emails_on_user_id_and_primary", unique: true, where: "(\"primary\" <> false)"
  end

  create_table "user_identities", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "provider", limit: 255, null: false
    t.string "uid", limit: 255, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["provider", "uid"], name: "index_user_identities_on_provider_and_uid", unique: true
    t.index ["user_id"], name: "fk__user_identities_user_id"
  end

  create_table "user_notifications", id: :serial, force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "user_id", null: false
    t.integer "notification_type", default: 0, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["activity_id"], name: "index_user_notifications_on_activity_id"
    t.index ["user_id"], name: "index_user_notifications_on_user_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.integer "role", default: 0, null: false
    t.string "time_zone", limit: 255
    t.text "profile_photo"
    t.string "encrypted_password", limit: 255, default: "", null: false
    t.string "reset_password_token", limit: 255
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at", precision: nil
    t.datetime "last_sign_in_at", precision: nil
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "locale", default: "en", null: false
    t.string "session_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "activities", "users", column: "actor_id", name: "fk_activities_actor_id"
  add_foreign_key "attachment_references", "attachments", name: "fk_attachment_references_attachment_id"
  add_foreign_key "attachment_references", "users", column: "creator_id", name: "fk_attachment_references_creator_id"
  add_foreign_key "attachment_references", "users", column: "updater_id", name: "fk_attachment_references_updater_id"
  add_foreign_key "cikgo_users", "users"
  add_foreign_key "course_achievements", "courses", name: "fk_course_achievements_course_id"
  add_foreign_key "course_achievements", "users", column: "creator_id", name: "fk_course_achievements_creator_id"
  add_foreign_key "course_achievements", "users", column: "updater_id", name: "fk_course_achievements_updater_id"
  add_foreign_key "course_announcements", "courses", name: "fk_course_announcements_course_id"
  add_foreign_key "course_announcements", "users", column: "creator_id", name: "fk_course_announcements_creator_id"
  add_foreign_key "course_announcements", "users", column: "updater_id", name: "fk_course_announcements_updater_id"
  add_foreign_key "course_assessment_answer_auto_gradings", "course_assessment_answers", column: "answer_id", name: "fk_course_assessment_answer_auto_gradings_answer_id"
  add_foreign_key "course_assessment_answer_auto_gradings", "jobs", name: "fk_course_assessment_answer_auto_gradings_job_id", on_delete: :nullify
  add_foreign_key "course_assessment_answer_forum_posts", "course_assessment_answer_forum_post_responses", column: "answer_id"
  add_foreign_key "course_assessment_answer_multiple_response_options", "course_assessment_answer_multiple_responses", column: "answer_id", name: "fk_course_assessment_answer_multiple_response_options_answer_id"
  add_foreign_key "course_assessment_answer_multiple_response_options", "course_assessment_question_multiple_response_options", column: "option_id", name: "fk_course_assessment_answer_multiple_response_options_option_id"
  add_foreign_key "course_assessment_answer_programming", "jobs", column: "codaveri_feedback_job_id", on_delete: :nullify
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
  add_foreign_key "course_assessments", "course_monitoring_monitors", column: "monitor_id"
  add_foreign_key "course_assessments", "users", column: "creator_id", name: "fk_course_assessments_creator_id"
  add_foreign_key "course_assessments", "users", column: "updater_id", name: "fk_course_assessments_updater_id"
  add_foreign_key "course_condition_achievements", "course_achievements", column: "achievement_id", name: "fk_course_condition_achievements_achievement_id"
  add_foreign_key "course_condition_assessments", "course_assessments", column: "assessment_id", name: "fk_course_condition_assessments_assessment_id"
  add_foreign_key "course_condition_surveys", "course_surveys", column: "survey_id", name: "fk_course_condition_surveys_survey_id"
  add_foreign_key "course_condition_videos", "course_videos", column: "video_id", name: "fk_course_condition_videos_video_id"
  add_foreign_key "course_conditions", "courses", name: "fk_course_conditions_course_id"
  add_foreign_key "course_conditions", "users", column: "creator_id", name: "fk_course_conditions_creator_id"
  add_foreign_key "course_conditions", "users", column: "updater_id", name: "fk_course_conditions_updater_id"
  add_foreign_key "course_discussion_post_codaveri_feedbacks", "course_discussion_posts", column: "post_id"
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
  add_foreign_key "course_enrol_requests", "users", column: "confirmer_id"
  add_foreign_key "course_enrol_requests", "users", column: "creator_id"
  add_foreign_key "course_enrol_requests", "users", column: "updater_id"
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
  add_foreign_key "course_group_categories", "courses"
  add_foreign_key "course_group_categories", "users", column: "creator_id"
  add_foreign_key "course_group_categories", "users", column: "updater_id"
  add_foreign_key "course_group_users", "course_groups", column: "group_id", name: "fk_course_group_users_course_group_id"
  add_foreign_key "course_group_users", "course_users", name: "fk_course_group_users_course_user_id"
  add_foreign_key "course_group_users", "users", column: "creator_id", name: "fk_course_group_users_creator_id"
  add_foreign_key "course_group_users", "users", column: "updater_id", name: "fk_course_group_users_updater_id"
  add_foreign_key "course_groups", "course_group_categories", column: "group_category_id"
  add_foreign_key "course_groups", "users", column: "creator_id", name: "fk_course_groups_creator_id"
  add_foreign_key "course_groups", "users", column: "updater_id", name: "fk_course_groups_updater_id"
  add_foreign_key "course_learning_maps", "courses", name: "fk_course_learning_maps_course_id"
  add_foreign_key "course_learning_rate_records", "course_users", name: "fk_course_learning_rate_records_course_user_id"
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
  add_foreign_key "course_monitoring_heartbeats", "course_monitoring_sessions", column: "session_id"
  add_foreign_key "course_monitoring_sessions", "course_monitoring_monitors", column: "monitor_id"
  add_foreign_key "course_monitoring_sessions", "users", column: "creator_id"
  add_foreign_key "course_notifications", "activities", name: "fk_course_notifications_activity_id"
  add_foreign_key "course_notifications", "courses", name: "fk_course_notifications_course_id"
  add_foreign_key "course_personal_times", "course_lesson_plan_items", column: "lesson_plan_item_id"
  add_foreign_key "course_personal_times", "course_users"
  add_foreign_key "course_question_assessments", "course_assessment_questions", column: "question_id", name: "fk_course_question_assessments_question_id"
  add_foreign_key "course_question_assessments", "course_assessments", column: "assessment_id", name: "fk_course_question_assessments_assessment_id"
  add_foreign_key "course_reference_timelines", "courses"
  add_foreign_key "course_reference_times", "course_lesson_plan_items", column: "lesson_plan_item_id"
  add_foreign_key "course_reference_times", "course_reference_timelines", column: "reference_timeline_id"
  add_foreign_key "course_settings_emails", "course_assessment_categories"
  add_foreign_key "course_settings_emails", "courses"
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
  add_foreign_key "course_user_email_unsubscriptions", "course_settings_emails"
  add_foreign_key "course_user_email_unsubscriptions", "course_users"
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
  add_foreign_key "duplication_traceable_assessments", "course_assessments", column: "assessment_id"
  add_foreign_key "duplication_traceable_courses", "courses"
  add_foreign_key "duplication_traceables", "users", column: "creator_id"
  add_foreign_key "duplication_traceables", "users", column: "updater_id"
  add_foreign_key "generic_announcements", "instances", name: "fk_generic_announcements_instance_id"
  add_foreign_key "generic_announcements", "users", column: "creator_id", name: "fk_generic_announcements_creator_id"
  add_foreign_key "generic_announcements", "users", column: "updater_id", name: "fk_generic_announcements_updater_id"
  add_foreign_key "instance_user_role_requests", "instances", name: "fk_instance_user_role_requests_instance_id"
  add_foreign_key "instance_user_role_requests", "users", column: "confirmer_id"
  add_foreign_key "instance_user_role_requests", "users", column: "creator_id"
  add_foreign_key "instance_user_role_requests", "users", column: "updater_id"
  add_foreign_key "instance_user_role_requests", "users", name: "fk_instance_user_role_requests_user_id"
  add_foreign_key "instance_users", "instances", name: "fk_instance_users_instance_id"
  add_foreign_key "instance_users", "users", name: "fk_instance_users_user_id"
  add_foreign_key "oauth_access_grants", "oauth_applications", column: "application_id"
  add_foreign_key "oauth_access_grants", "users", column: "resource_owner_id"
  add_foreign_key "oauth_access_tokens", "oauth_applications", column: "application_id"
  add_foreign_key "oauth_access_tokens", "users", column: "resource_owner_id"
  add_foreign_key "polyglot_languages", "polyglot_languages", column: "parent_id", name: "fk_polyglot_languages_parent_id"
  add_foreign_key "user_emails", "users", name: "fk_user_emails_user_id"
  add_foreign_key "user_identities", "users", name: "fk_user_identities_user_id"
  add_foreign_key "user_notifications", "activities", name: "fk_user_notifications_activity_id"
  add_foreign_key "user_notifications", "users", name: "fk_user_notifications_user_id"
end
