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

ActiveRecord::Schema.define(version: 20180414144225) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "activities", force: :cascade do |t|
    t.integer  "actor_id",      :null=>false, :index=>{:name=>"fk__activities_actor_id", :order=>{:actor_id=>:asc}}
    t.integer  "object_id",     :null=>false
    t.string   "object_type",   :limit=>255, :null=>false
    t.string   "event",         :limit=>255, :null=>false
    t.string   "notifier_type", :limit=>255, :null=>false
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "attachment_references", id: :uuid, default: %q{uuid_generate_v4()}, force: :cascade do |t|
    t.integer  "attachable_id"
    t.string   "attachable_type", :limit=>255, :index=>{:name=>"fk__attachment_references_attachable_id", :with=>["attachable_id"], :order=>{:attachable_type=>:asc, :attachable_id=>:asc}}
    t.integer  "attachment_id",   :null=>false, :index=>{:name=>"fk__attachment_references_attachment_id", :order=>{:attachment_id=>:asc}}
    t.string   "name",            :limit=>255, :null=>false
    t.datetime "expires_at"
    t.integer  "creator_id",      :null=>false, :index=>{:name=>"fk__attachment_references_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",      :null=>false, :index=>{:name=>"fk__attachment_references_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",      :null=>false
    t.datetime "updated_at",      :null=>false
  end

  create_table "attachments", force: :cascade do |t|
    t.string   "name",        :limit=>255, :null=>false, :index=>{:name=>"index_attachments_on_name", :unique=>true, :order=>{:name=>:asc}}
    t.text     "file_upload", :null=>false
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_achievements", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_achievements_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.text     "badge"
    t.integer  "weight",      :null=>false
    t.boolean  "published",   :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_achievements_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_achievements_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_announcements", force: :cascade do |t|
    t.integer  "course_id",              :null=>false, :index=>{:name=>"fk__course_announcements_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",                  :limit=>255, :null=>false
    t.text     "content"
    t.boolean  "sticky",                 :default=>false, :null=>false
    t.datetime "start_at",               :null=>false
    t.datetime "end_at",                 :null=>false
    t.float    "opening_reminder_token"
    t.integer  "creator_id",             :null=>false, :index=>{:name=>"fk__course_announcements_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",             :null=>false, :index=>{:name=>"fk__course_announcements_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",             :null=>false
    t.datetime "updated_at",             :null=>false
  end

  create_table "course_assessment_answer_auto_gradings", force: :cascade do |t|
    t.integer  "actable_id",   :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_actable", :with=>["actable_type"], :unique=>true, :order=>{:actable_id=>:asc, :actable_type=>:asc}}
    t.string   "actable_type", :limit=>255
    t.integer  "answer_id",    :null=>false, :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_answer_id", :unique=>true, :order=>{:answer_id=>:asc}}
    t.uuid     "job_id",       :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_job_id", :unique=>true, :order=>{:job_id=>:asc}}
    t.json     "result"
    t.datetime "created_at",   :null=>false
    t.datetime "updated_at",   :null=>false
  end

  create_table "course_assessment_answer_multiple_response_options", force: :cascade do |t|
    t.integer "answer_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_answer", :order=>{:answer_id=>:asc}}
    t.integer "option_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_question_option", :order=>{:option_id=>:asc}}

    t.index ["answer_id", "option_id"], :name=>"index_multiple_response_answer_on_answer_id_and_option_id", :unique=>true, :order=>{:answer_id=>:asc, :option_id=>:asc}
  end

  create_table "course_assessment_answer_multiple_responses", force: :cascade do |t|
  end

  create_table "course_assessment_answer_programming", force: :cascade do |t|
  end

  create_table "course_assessment_answer_programming_auto_gradings", force: :cascade do |t|
    t.text    "stdout"
    t.text    "stderr"
    t.integer "exit_code"
  end

  create_table "course_assessment_answer_programming_file_annotations", force: :cascade do |t|
    t.integer "file_id", :null=>false, :index=>{:name=>"fk__course_assessment_answe_09c4b638af92d0f8252d7cdef59bd6f3", :order=>{:file_id=>:asc}}
    t.integer "line",    :null=>false
  end

  create_table "course_assessment_answer_programming_files", force: :cascade do |t|
    t.integer "answer_id", :null=>false, :index=>{:name=>"fk__course_assessment_answer_programming_files_answer_id", :order=>{:answer_id=>:asc}}
    t.string  "filename",  :limit=>255, :null=>false
    t.text    "content",   :default=>"", :null=>false

    t.index ["answer_id", "filename"], :name=>"index_course_assessment_answer_programming_files_filename", :unique=>true, :case_sensitive=>false
  end

  create_table "course_assessment_answer_programming_test_results", force: :cascade do |t|
    t.integer "auto_grading_id", :null=>false, :index=>{:name=>"fk__course_assessment_answe_3d4bf9a99ed787551e4454c7106971fc", :order=>{:auto_grading_id=>:asc}}
    t.integer "test_case_id",    :index=>{:name=>"fk__course_assessment_answe_ca0d5ba368869806d2a9cb8717feed4f", :order=>{:test_case_id=>:asc}}
    t.boolean "passed",          :null=>false
    t.jsonb   "messages",        :default=>{}, :null=>false
  end

  create_table "course_assessment_answer_scribing_scribbles", force: :cascade do |t|
    t.text     "content"
    t.integer  "answer_id",  :index=>{:name=>"fk__course_assessment_answer_scribing_scribbles_scribing_answer", :order=>{:answer_id=>:asc}}
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_assessment_answer_scribing_scribbles_creator_id", :order=>{:creator_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_assessment_answer_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_answer_text_responses", force: :cascade do |t|
    t.text "answer_text"
  end

  create_table "course_assessment_answer_voice_responses", force: :cascade do |t|
  end

  create_table "course_assessment_answers", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",   :limit=>255, :index=>{:name=>"index_course_assessment_answers_actable", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.integer  "submission_id",  :null=>false, :index=>{:name=>"fk__course_assessment_answers_submission_id", :order=>{:submission_id=>:asc}}
    t.integer  "question_id",    :null=>false, :index=>{:name=>"fk__course_assessment_answers_question_id", :order=>{:question_id=>:asc}}
    t.boolean  "current_answer", :default=>false, :null=>false
    t.string   "workflow_state", :limit=>255, :null=>false
    t.datetime "submitted_at"
    t.decimal  "grade",          :precision=>4, :scale=>1
    t.boolean  "correct",        :comment=>"Correctness is independent of the grade (depends on the grading schema)"
    t.integer  "grader_id",      :index=>{:name=>"fk__course_assessment_answers_grader_id", :order=>{:grader_id=>:asc}}
    t.datetime "graded_at"
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
  end

  create_table "course_assessment_categories", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_assessment_categories_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",      :limit=>255, :null=>false
    t.integer  "weight",     :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_assessment_categories_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_assessment_categories_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_assessment_question_multiple_response_options", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_question", :order=>{:question_id=>:asc}}
    t.boolean "correct",     :null=>false
    t.text    "option",      :null=>false
    t.text    "explanation"
    t.integer "weight",      :null=>false
  end

  create_table "course_assessment_question_multiple_responses", force: :cascade do |t|
    t.integer "grading_scheme", :default=>0, :null=>false
  end

  create_table "course_assessment_question_programming", force: :cascade do |t|
    t.integer "language_id",              :null=>false, :index=>{:name=>"fk__course_assessment_question_programming_language_id", :order=>{:language_id=>:asc}}
    t.integer "memory_limit",             :comment=>"Memory limit, in MiB"
    t.integer "time_limit",               :comment=>"Time limit, in seconds"
    t.integer "attempt_limit"
    t.uuid    "import_job_id",            :comment=>"The ID of the importing job", :index=>{:name=>"index_course_assessment_question_programming_on_import_job_id", :unique=>true, :order=>{:import_job_id=>:asc}}
    t.integer "package_type",             :default=>0, :null=>false
    t.boolean "multiple_file_submission", :default=>false, :null=>false
  end

  create_table "course_assessment_question_programming_template_files", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_assessment_quest_dbf3aed51f19fcc63a25d296a057dd1f", :order=>{:question_id=>:asc}}
    t.string  "filename",    :limit=>255, :null=>false
    t.text    "content",     :null=>false

    t.index ["question_id", "filename"], :name=>"index_course_assessment_question_programming_template_filenames", :unique=>true, :case_sensitive=>false
  end

  create_table "course_assessment_question_programming_test_cases", force: :cascade do |t|
    t.integer "question_id",    :null=>false, :index=>{:name=>"fk__course_assessment_quest_18b37224652fc59d955122a17ba20d07", :order=>{:question_id=>:asc}}
    t.string  "identifier",     :limit=>255, :null=>false, :comment=>"Test case identifier generated by the testing framework", :index=>{:name=>"index_course_assessment_question_programming_test_case_ident", :with=>["question_id"], :unique=>true, :order=>{:identifier=>:asc, :question_id=>:asc}}
    t.integer "test_case_type", :null=>false
    t.text    "expression"
    t.text    "expected"
    t.text    "hint"
  end

  create_table "course_assessment_question_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_question_text_response_compre_groups", force: :cascade do |t|
    t.integer "question_id",         :null=>false, :index=>{:name=>"fk__course_assessment_text_response_compre_group_question", :order=>{:question_id=>:asc}}
    t.decimal "maximum_group_grade", :precision=>4, :scale=>1, :default=>"0.0", :null=>false
  end

  create_table "course_assessment_question_text_response_compre_points", force: :cascade do |t|
    t.integer "group_id",    :null=>false, :index=>{:name=>"fk__course_assessment_text_response_compre_point_group", :order=>{:group_id=>:asc}}
    t.decimal "point_grade", :precision=>4, :scale=>1, :default=>"0.0", :null=>false
  end

  create_table "course_assessment_question_text_response_compre_solutions", force: :cascade do |t|
    t.integer "point_id",       :null=>false, :index=>{:name=>"fk__course_assessment_text_response_compre_solution_point", :order=>{:point_id=>:asc}}
    t.integer "solution_type",  :default=>0, :null=>false
    t.string  "solution",       :default=>[], :null=>false, :array=>true
    t.string  "solution_lemma", :default=>[], :null=>false, :array=>true
    t.string  "information",    :limit=>255
  end

  create_table "course_assessment_question_text_response_solutions", force: :cascade do |t|
    t.integer "question_id",   :null=>false, :index=>{:name=>"fk__course_assessment_text_response_solution_question", :order=>{:question_id=>:asc}}
    t.integer "solution_type", :default=>0, :null=>false
    t.text    "solution",      :null=>false
    t.decimal "grade",         :precision=>4, :scale=>1, :default=>"0.0", :null=>false
    t.text    "explanation"
  end

  create_table "course_assessment_question_text_responses", force: :cascade do |t|
    t.boolean "allow_attachment", :default=>false
    t.boolean "hide_text",        :default=>false
    t.boolean "is_comprehension", :default=>false
  end

  create_table "course_assessment_question_voice_responses", force: :cascade do |t|
  end

  create_table "course_assessment_questions", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",        :limit=>255, :index=>{:name=>"index_course_assessment_questions_actable", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.string   "title",               :limit=>255
    t.text     "description"
    t.text     "staff_only_comments"
    t.decimal  "maximum_grade",       :precision=>4, :scale=>1, :null=>false
    t.integer  "creator_id",          :null=>false, :index=>{:name=>"fk__course_assessment_questions_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",          :null=>false, :index=>{:name=>"fk__course_assessment_questions_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",          :null=>false
    t.datetime "updated_at",          :null=>false
  end

  create_table "course_assessment_questions_skills", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"course_assessment_question_skills_question_index", :order=>{:question_id=>:asc}}
    t.integer "skill_id",    :null=>false, :index=>{:name=>"course_assessment_question_skills_skill_index", :order=>{:skill_id=>:asc}}
  end

  create_table "course_assessment_skill_branches", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_assessment_skills", force: :cascade do |t|
    t.integer  "course_id",       :null=>false, :index=>{:name=>"fk__course_assessment_skills_course_id", :order=>{:course_id=>:asc}}
    t.integer  "skill_branch_id", :index=>{:name=>"fk__course_assessment_skills_skill_branch_id", :order=>{:skill_branch_id=>:asc}}
    t.string   "title",           :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",      :null=>false, :index=>{:name=>"fk__course_assessment_skills_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",      :null=>false, :index=>{:name=>"fk__course_assessment_skills_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",      :null=>false
    t.datetime "updated_at",      :null=>false
  end

  create_table "course_assessment_submission_logs", force: :cascade do |t|
    t.integer  "submission_id", :null=>false, :index=>{:name=>"fk__course_assessment_submission_logs_submission_id", :order=>{:submission_id=>:asc}}
    t.jsonb    "request"
    t.datetime "created_at",    :null=>false
  end

  create_table "course_assessment_submission_questions", force: :cascade do |t|
    t.integer  "submission_id", :null=>false, :index=>{:name=>"fk__course_assessment_submission_questions_submission_id", :order=>{:submission_id=>:asc}}
    t.integer  "question_id",   :null=>false, :index=>{:name=>"fk__course_assessment_submission_questions_question_id", :order=>{:question_id=>:asc}}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false

    t.index ["submission_id", "question_id"], :name=>"idx_course_assessment_submission_questions_on_sub_and_qn", :unique=>true, :order=>{:submission_id=>:asc, :question_id=>:asc}
  end

  create_table "course_assessment_submissions", force: :cascade do |t|
    t.integer  "assessment_id",  :null=>false, :index=>{:name=>"fk__course_assessment_submissions_assessment_id", :order=>{:assessment_id=>:asc}}
    t.string   "workflow_state", :limit=>255, :null=>false
    t.string   "session_id",     :limit=>255
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_assessment_submissions_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_assessment_submissions_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
    t.integer  "publisher_id",   :index=>{:name=>"fk__course_assessment_submissions_publisher_id", :order=>{:publisher_id=>:asc}}
    t.datetime "published_at"
    t.datetime "submitted_at"

    t.index ["assessment_id", "creator_id"], :name=>"unique_assessment_id_and_creator_id", :unique=>true, :order=>{:assessment_id=>:asc, :creator_id=>:asc}
  end

  create_table "course_assessment_tabs", force: :cascade do |t|
    t.integer  "category_id", :null=>false, :index=>{:name=>"fk__course_assessment_tabs_category_id", :order=>{:category_id=>:asc}}
    t.string   "title",       :limit=>255, :null=>false
    t.integer  "weight",      :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_assessment_tabs_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_assessment_tabs_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_assessments", force: :cascade do |t|
    t.integer  "tab_id",                    :null=>false, :index=>{:name=>"fk__course_assessments_tab_id", :order=>{:tab_id=>:asc}}
    t.boolean  "tabbed_view",               :default=>false, :null=>false
    t.boolean  "autograded",                :null=>false
    t.boolean  "show_private",              :default=>false, :comment=>"Show private test cases after students answer correctly"
    t.boolean  "show_evaluation",           :default=>false, :comment=>"Show evaluation test cases after students answer correctly"
    t.boolean  "skippable",                 :default=>false
    t.boolean  "delayed_grade_publication", :default=>false
    t.string   "session_password",          :limit=>255
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_assessments_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_assessments_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
    t.string   "view_password",             :limit=>255
  end

  create_table "course_condition_achievements", force: :cascade do |t|
    t.integer "achievement_id", :null=>false, :index=>{:name=>"fk__course_condition_achievements_achievement_id", :order=>{:achievement_id=>:asc}}
  end

  create_table "course_condition_assessments", force: :cascade do |t|
    t.integer "assessment_id",            :null=>false, :index=>{:name=>"fk__course_condition_assessments_assessment_id", :order=>{:assessment_id=>:asc}}
    t.float   "minimum_grade_percentage"
  end

  create_table "course_condition_levels", force: :cascade do |t|
    t.integer "minimum_level", :null=>false
  end

  create_table "course_conditions", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",     :limit=>255, :index=>{:name=>"index_course_conditions_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.integer  "course_id",        :null=>false, :index=>{:name=>"fk__course_conditions_course_id", :order=>{:course_id=>:asc}}
    t.integer  "conditional_id",   :null=>false
    t.string   "conditional_type", :limit=>255, :null=>false, :index=>{:name=>"index_course_conditions_on_conditional_type_and_conditional_id", :with=>["conditional_id"], :order=>{:conditional_type=>:asc, :conditional_id=>:asc}}
    t.integer  "creator_id",       :null=>false, :index=>{:name=>"fk__course_conditions_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",       :null=>false, :index=>{:name=>"fk__course_conditions_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",       :null=>false
    t.datetime "updated_at",       :null=>false
  end

  create_table "course_discussion_post_votes", force: :cascade do |t|
    t.integer  "post_id",    :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_post_id", :order=>{:post_id=>:asc}}
    t.boolean  "vote_flag",  :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false

    t.index ["post_id", "creator_id"], :name=>"index_course_discussion_post_votes_on_post_id_and_creator_id", :unique=>true, :order=>{:post_id=>:asc, :creator_id=>:asc}
  end

  create_table "course_discussion_posts", force: :cascade do |t|
    t.integer  "parent_id",  :index=>{:name=>"fk__course_discussion_posts_parent_id", :order=>{:parent_id=>:asc}}
    t.integer  "topic_id",   :null=>false, :index=>{:name=>"fk__course_discussion_posts_topic_id", :order=>{:topic_id=>:asc}}
    t.string   "title",      :limit=>255
    t.text     "text"
    t.boolean  "answer",     :default=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_discussion_posts_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_discussion_posts_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_discussion_topic_subscriptions", force: :cascade do |t|
    t.integer "topic_id", :null=>false, :index=>{:name=>"fk__course_discussion_topic_subscriptions_topic_id", :order=>{:topic_id=>:asc}}
    t.integer "user_id",  :null=>false, :index=>{:name=>"fk__course_discussion_topic_subscriptions_user_id", :order=>{:user_id=>:asc}}

    t.index ["topic_id", "user_id"], :name=>"index_topic_subscriptions_on_topic_id_and_user_id", :unique=>true, :order=>{:topic_id=>:asc, :user_id=>:asc}
  end

  create_table "course_discussion_topics", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",        :limit=>255, :index=>{:name=>"index_course_discussion_topics_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.integer  "course_id",           :null=>false, :index=>{:name=>"fk__course_discussion_topics_course_id", :order=>{:course_id=>:asc}}
    t.boolean  "pending_staff_reply", :default=>false, :null=>false
    t.datetime "created_at",          :null=>false
    t.datetime "updated_at",          :null=>false
  end

  create_table "course_enrol_requests", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_enrol_requests_course_id", :order=>{:course_id=>:asc}}
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__course_enrol_requests_user_id", :order=>{:user_id=>:asc}}
    t.datetime "created_at"
    t.datetime "updated_at"

    t.index ["course_id", "user_id"], :name=>"index_course_enrol_requests_on_course_id_and_user_id", :unique=>true, :order=>{:course_id=>:asc, :user_id=>:asc}
  end

  create_table "course_experience_points_records", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",         :limit=>255, :index=>{:name=>"index_course_experience_points_records_on_actable", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.integer  "draft_points_awarded"
    t.integer  "points_awarded"
    t.integer  "course_user_id",       :null=>false, :index=>{:name=>"fk__course_experience_points_records_course_user_id", :order=>{:course_user_id=>:asc}}
    t.string   "reason",               :limit=>255
    t.integer  "creator_id",           :null=>false, :index=>{:name=>"fk__course_experience_points_records_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",           :null=>false, :index=>{:name=>"fk__course_experience_points_records_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",           :null=>false
    t.datetime "updated_at",           :null=>false
    t.integer  "awarder_id",           :index=>{:name=>"fk__course_experience_points_records_awarder_id", :order=>{:awarder_id=>:asc}}
    t.datetime "awarded_at"
  end

  create_table "course_forum_subscriptions", force: :cascade do |t|
    t.integer "forum_id", :null=>false, :index=>{:name=>"fk__course_forum_subscriptions_forum_id", :order=>{:forum_id=>:asc}}
    t.integer "user_id",  :null=>false, :index=>{:name=>"fk__course_forum_subscriptions_user_id", :order=>{:user_id=>:asc}}

    t.index ["forum_id", "user_id"], :name=>"index_course_forum_subscriptions_on_forum_id_and_user_id", :unique=>true, :order=>{:forum_id=>:asc, :user_id=>:asc}
  end

  create_table "course_forum_topic_views", force: :cascade do |t|
    t.integer  "topic_id",   :null=>false, :index=>{:name=>"fk__course_forum_topic_views_topic_id", :order=>{:topic_id=>:asc}}
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__course_forum_topic_views_user_id", :order=>{:user_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_forum_topics", force: :cascade do |t|
    t.integer  "forum_id",       :null=>false, :index=>{:name=>"fk__course_forum_topics_forum_id", :order=>{:forum_id=>:asc}}
    t.string   "title",          :limit=>255, :null=>false
    t.string   "slug",           :limit=>255
    t.boolean  "locked",         :default=>false
    t.boolean  "hidden",         :default=>false
    t.integer  "topic_type",     :default=>0
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_forum_topics_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_forum_topics_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
    t.boolean  "resolved",       :default=>false, :null=>false
    t.datetime "latest_post_at", :null=>false

    t.index ["forum_id", "slug"], :name=>"index_course_forum_topics_on_forum_id_and_slug", :unique=>true, :order=>{:forum_id=>:asc, :slug=>:asc}
  end

  create_table "course_forums", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_forums_course_id", :order=>{:course_id=>:asc}}
    t.string   "name",        :limit=>255, :null=>false
    t.string   "slug",        :limit=>255
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_forums_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_forums_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false

    t.index ["course_id", "slug"], :name=>"index_course_forums_on_course_id_and_slug", :unique=>true, :order=>{:course_id=>:asc, :slug=>:asc}
  end

  create_table "course_group_users", force: :cascade do |t|
    t.integer  "group_id",       :null=>false, :index=>{:name=>"fk__course_group_users_course_group_id", :order=>{:group_id=>:asc}}
    t.integer  "course_user_id", :null=>false, :index=>{:name=>"fk__course_group_users_course_user_id", :order=>{:course_user_id=>:asc}}
    t.integer  "role",           :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_group_users_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_group_users_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false

    t.index ["course_user_id", "group_id"], :name=>"index_course_group_users_on_course_user_id_and_course_group_id", :unique=>true, :order=>{:course_user_id=>:asc, :group_id=>:asc}
  end

  create_table "course_groups", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_groups_course_id", :order=>{:course_id=>:asc}}
    t.string   "name",        :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_groups_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_groups_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false

    t.index ["course_id", "name"], :name=>"index_course_groups_on_course_id_and_name", :unique=>true, :order=>{:course_id=>:asc, :name=>:asc}
  end

  create_table "course_lesson_plan_event_materials", force: :cascade do |t|
    t.integer "lesson_plan_event_id", :null=>false, :index=>{:name=>"fk__course_lesson_plan_event_materials_lesson_plan_event_id", :order=>{:lesson_plan_event_id=>:asc}}
    t.integer "material_id",          :null=>false, :index=>{:name=>"fk__course_lesson_plan_event_materials_material_id", :order=>{:material_id=>:asc}}
  end

  create_table "course_lesson_plan_events", force: :cascade do |t|
    t.string "location",   :limit=>255
    t.string "event_type", :limit=>255, :null=>false
  end

  create_table "course_lesson_plan_items", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",           :limit=>255, :index=>{:name=>"index_course_lesson_plan_items_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true, :order=>{:actable_type=>:asc, :actable_id=>:asc}}
    t.integer  "course_id",              :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",                  :limit=>255, :null=>false
    t.text     "description"
    t.boolean  "published",              :default=>false, :null=>false
    t.integer  "base_exp",               :null=>false
    t.integer  "time_bonus_exp",         :null=>false
    t.datetime "start_at",               :null=>false
    t.datetime "bonus_end_at"
    t.datetime "end_at"
    t.float    "closing_reminder_token"
    t.integer  "creator_id",             :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",             :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",             :null=>false
    t.datetime "updated_at",             :null=>false
  end

  create_table "course_lesson_plan_milestones", force: :cascade do |t|
    t.integer  "course_id",   :index=>{:name=>"fk__course_lesson_plan_milestones_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.datetime "start_at",    :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_lesson_plan_milestones_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_lesson_plan_milestones_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_lesson_plan_todos", force: :cascade do |t|
    t.integer  "item_id",        :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_item_id", :order=>{:item_id=>:asc}}
    t.integer  "user_id",        :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_user_id", :order=>{:user_id=>:asc}}
    t.string   "workflow_state", :limit=>255, :null=>false
    t.boolean  "ignore",         :default=>false, :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at"
    t.datetime "updated_at"

    t.index ["item_id", "user_id"], :name=>"index_course_lesson_plan_todos_on_item_id_and_user_id", :unique=>true, :order=>{:item_id=>:asc, :user_id=>:asc}
  end

  create_table "course_levels", force: :cascade do |t|
    t.integer  "course_id",                   :null=>false, :index=>{:name=>"fk__course_levels_course_id", :order=>{:course_id=>:asc}}
    t.integer  "experience_points_threshold", :null=>false
    t.datetime "created_at",                  :null=>false
    t.datetime "updated_at",                  :null=>false

    t.index ["course_id", "experience_points_threshold"], :name=>"index_experience_points_threshold_on_course_id", :unique=>true, :order=>{:course_id=>:asc, :experience_points_threshold=>:asc}
  end

  create_table "course_material_folders", force: :cascade do |t|
    t.integer  "parent_id",          :index=>{:name=>"fk__course_material_folders_parent_id", :order=>{:parent_id=>:asc}}
    t.integer  "course_id",          :null=>false, :index=>{:name=>"fk__course_material_folders_course_id", :order=>{:course_id=>:asc}}
    t.integer  "owner_id",           :index=>{:name=>"index_course_material_folders_on_owner_id_and_owner_type", :with=>["owner_type"], :unique=>true, :order=>{:owner_id=>:asc, :owner_type=>:asc}}
    t.string   "owner_type",         :limit=>255, :index=>{:name=>"fk__course_material_folders_owner_id", :with=>["owner_id"], :order=>{:owner_type=>:asc, :owner_id=>:asc}}
    t.string   "name",               :limit=>255, :null=>false
    t.text     "description"
    t.boolean  "can_student_upload", :default=>false, :null=>false
    t.datetime "start_at",           :null=>false
    t.datetime "end_at"
    t.integer  "creator_id",         :null=>false, :index=>{:name=>"fk__course_material_folders_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",         :null=>false, :index=>{:name=>"fk__course_material_folders_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",         :null=>false
    t.datetime "updated_at",         :null=>false

    t.index ["parent_id", "name"], :name=>"index_course_material_folders_on_parent_id_and_name", :unique=>true, :case_sensitive=>false
  end

  create_table "course_materials", force: :cascade do |t|
    t.integer  "folder_id",   :null=>false, :index=>{:name=>"fk__course_materials_folder_id", :order=>{:folder_id=>:asc}}
    t.string   "name",        :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_materials_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_materials_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false

    t.index ["folder_id", "name"], :name=>"index_course_materials_on_folder_id_and_name", :unique=>true, :case_sensitive=>false
  end

  create_table "course_notifications", force: :cascade do |t|
    t.integer  "activity_id",       :null=>false, :index=>{:name=>"index_course_notifications_on_activity_id", :order=>{:activity_id=>:asc}}
    t.integer  "course_id",         :null=>false, :index=>{:name=>"index_course_notifications_on_course_id", :order=>{:course_id=>:asc}}
    t.integer  "notification_type", :default=>0, :null=>false
    t.datetime "created_at",        :null=>false
    t.datetime "updated_at",        :null=>false
  end

  create_table "course_question_assessments", force: :cascade do |t|
    t.integer "question_id",   :null=>false, :index=>{:name=>"index_course_question_assessments_on_question_id", :order=>{:question_id=>:asc}}
    t.integer "assessment_id", :null=>false, :index=>{:name=>"index_course_question_assessments_on_assessment_id", :order=>{:assessment_id=>:asc}}
    t.integer "weight",        :null=>false

    t.index ["question_id", "assessment_id"], :name=>"index_question_assessments_on_question_id_and_assessment_id", :unique=>true, :order=>{:question_id=>:asc, :assessment_id=>:asc}
  end

  create_table "course_survey_answer_options", force: :cascade do |t|
    t.integer "answer_id",          :null=>false, :index=>{:name=>"fk__course_survey_answer_options_answer_id", :order=>{:answer_id=>:asc}}
    t.integer "question_option_id", :null=>false, :index=>{:name=>"fk__course_survey_answer_options_question_option_id", :order=>{:question_option_id=>:asc}}
  end

  create_table "course_survey_answers", force: :cascade do |t|
    t.integer  "question_id",   :null=>false, :index=>{:name=>"fk__course_survey_answers_question_id", :order=>{:question_id=>:asc}}
    t.integer  "response_id",   :null=>false, :index=>{:name=>"fk__course_survey_answers_response_id", :order=>{:response_id=>:asc}}
    t.text     "text_response"
    t.integer  "creator_id",    :null=>false, :index=>{:name=>"fk__course_survey_answers_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",    :null=>false, :index=>{:name=>"fk__course_survey_answers_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "course_survey_question_options", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_survey_question_options_question_id", :order=>{:question_id=>:asc}}
    t.text    "option"
    t.integer "weight",      :null=>false
  end

  create_table "course_survey_questions", force: :cascade do |t|
    t.integer  "section_id",    :null=>false, :index=>{:name=>"index_course_survey_questions_on_section_id", :order=>{:section_id=>:asc}}
    t.integer  "question_type", :default=>0, :null=>false
    t.text     "description",   :null=>false
    t.integer  "weight",        :null=>false
    t.boolean  "required",      :default=>false, :null=>false
    t.boolean  "grid_view",     :default=>false, :null=>false
    t.integer  "max_options"
    t.integer  "min_options"
    t.integer  "creator_id",    :null=>false, :index=>{:name=>"fk__course_survey_questions_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",    :null=>false, :index=>{:name=>"fk__course_survey_questions_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "course_survey_responses", force: :cascade do |t|
    t.integer  "survey_id",    :null=>false, :index=>{:name=>"fk__course_survey_responses_survey_id", :order=>{:survey_id=>:asc}}
    t.datetime "submitted_at"
    t.integer  "creator_id",   :null=>false, :index=>{:name=>"fk__course_survey_responses_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",   :null=>false, :index=>{:name=>"fk__course_survey_responses_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",   :null=>false
    t.datetime "updated_at",   :null=>false

    t.index ["survey_id", "creator_id"], :name=>"index_course_survey_responses_on_survey_id_and_creator_id", :unique=>true, :order=>{:survey_id=>:asc, :creator_id=>:asc}
  end

  create_table "course_survey_sections", force: :cascade do |t|
    t.integer "survey_id",   :null=>false, :index=>{:name=>"fk__course_survey_sections_survey_id", :order=>{:survey_id=>:asc}}
    t.string  "title",       :limit=>255, :null=>false
    t.text    "description"
    t.integer "weight",      :null=>false
  end

  create_table "course_surveys", force: :cascade do |t|
    t.boolean  "anonymous",                 :default=>false, :null=>false
    t.boolean  "allow_modify_after_submit", :default=>false, :null=>false
    t.boolean  "allow_response_after_end",  :default=>false, :null=>false
    t.datetime "closing_reminded_at"
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_surveys_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_surveys_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
  end

  create_table "course_user_achievements", force: :cascade do |t|
    t.integer  "course_user_id", :index=>{:name=>"fk__course_user_achievements_course_user_id", :order=>{:course_user_id=>:asc}}
    t.integer  "achievement_id", :index=>{:name=>"fk__course_user_achievements_achievement_id", :order=>{:achievement_id=>:asc}}
    t.datetime "obtained_at",    :null=>false
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false

    t.index ["course_user_id", "achievement_id"], :name=>"index_user_achievements_on_course_user_id_and_achievement_id", :unique=>true, :order=>{:course_user_id=>:asc, :achievement_id=>:asc}
  end

  create_table "course_user_invitations", force: :cascade do |t|
    t.integer  "course_id",      :null=>false, :index=>{:name=>"fk__course_user_invitations_course_id", :order=>{:course_id=>:asc}}
    t.string   "name",           :limit=>255, :null=>false
    t.string   "email",          :limit=>255, :null=>false, :index=>{:name=>"index_course_user_invitations_on_email", :case_sensitive=>false}
    t.integer  "role",           :default=>0, :null=>false
    t.boolean  "phantom",        :default=>false, :null=>false
    t.string   "invitation_key", :limit=>32, :null=>false, :index=>{:name=>"index_course_user_invitations_on_invitation_key", :unique=>true, :order=>{:invitation_key=>:asc}}
    t.datetime "sent_at"
    t.datetime "confirmed_at"
    t.integer  "confirmer_id",   :index=>{:name=>"fk__course_user_invitations_confirmer_id", :order=>{:confirmer_id=>:asc}}
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_user_invitations_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_user_invitations_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false

    t.index ["course_id", "email"], :name=>"index_course_user_invitations_on_course_id_and_email", :unique=>true, :order=>{:course_id=>:asc, :email=>:asc}
  end

  create_table "course_users", force: :cascade do |t|
    t.integer  "course_id",      :null=>false, :index=>{:name=>"fk__course_users_course_id", :order=>{:course_id=>:asc}}
    t.integer  "user_id",        :null=>false, :index=>{:name=>"fk__course_users_user_id", :order=>{:user_id=>:asc}}
    t.integer  "role",           :default=>0, :null=>false
    t.string   "name",           :limit=>255, :null=>false
    t.boolean  "phantom",        :default=>false, :null=>false
    t.datetime "last_active_at"
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_users_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_users_updater_id", :order=>{:updater_id=>:asc}}

    t.index ["course_id", "user_id"], :name=>"index_course_users_on_course_id_and_user_id", :unique=>true, :order=>{:course_id=>:asc, :user_id=>:asc}
  end

  create_table "course_video_events", force: :cascade do |t|
    t.integer  "session_id",    :null=>false, :index=>{:name=>"index_course_video_events_on_session_id", :order=>{:session_id=>:asc}}
    t.integer  "event_type",    :null=>false
    t.integer  "sequence_num",  :null=>false
    t.integer  "video_time",    :null=>false
    t.float    "playback_rate"
    t.datetime "event_time",    :null=>false
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false

    t.index ["session_id", "sequence_num"], :name=>"index_course_video_events_on_session_id_and_sequence_num", :unique=>true, :order=>{:session_id=>:asc, :sequence_num=>:asc}
  end

  create_table "course_video_sessions", force: :cascade do |t|
    t.integer  "submission_id",   :null=>false, :index=>{:name=>"index_course_video_sessions_on_submission_id", :order=>{:submission_id=>:asc}}
    t.datetime "session_start",   :null=>false
    t.datetime "session_end",     :null=>false
    t.integer  "last_video_time"
    t.datetime "created_at",      :null=>false
    t.datetime "updated_at",      :null=>false
    t.integer  "creator_id",      :null=>false, :index=>{:name=>"index_course_video_sessions_on_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",      :null=>false, :index=>{:name=>"index_course_video_sessions_on_updater_id", :order=>{:updater_id=>:asc}}
  end

  create_table "course_video_submissions", force: :cascade do |t|
    t.integer  "video_id",   :null=>false, :index=>{:name=>"fk__course_video_submissions_video_id", :order=>{:video_id=>:asc}}
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_video_submissions_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_video_submissions_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false

    t.index ["video_id", "creator_id"], :name=>"index_course_video_submissions_on_video_id_and_creator_id", :unique=>true, :order=>{:video_id=>:asc, :creator_id=>:asc}
  end

  create_table "course_video_tabs", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_video_tabs_course_id", :order=>{:course_id=>:asc}}
    t.string   "title",      :limit=>255, :null=>false
    t.integer  "weight",     :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_video_tabs_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_video_tabs_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_video_topics", force: :cascade do |t|
    t.integer "video_id",   :null=>false, :index=>{:name=>"fk__course_video_topics_video_id", :order=>{:video_id=>:asc}}
    t.integer "timestamp",  :null=>false
    t.integer "creator_id", :null=>false, :index=>{:name=>"index_course_video_topics_on_creator_id", :order=>{:creator_id=>:asc}}
    t.integer "updater_id", :null=>false, :index=>{:name=>"index_course_video_topics_on_updater_id", :order=>{:updater_id=>:asc}}
  end

  create_table "course_videos", force: :cascade do |t|
    t.integer  "tab_id",     :null=>false, :index=>{:name=>"fk__course_videos_tab_id", :order=>{:tab_id=>:asc}}
    t.string   "url",        :limit=>255, :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_videos_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_videos_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_virtual_classrooms", force: :cascade do |t|
    t.integer  "course_id",                 :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_course_id", :order=>{:course_id=>:asc}}
    t.text     "instructor_classroom_link"
    t.integer  "classroom_id"
    t.string   "title",                     :limit=>255, :null=>false
    t.text     "content"
    t.datetime "start_at",                  :null=>false
    t.datetime "end_at",                    :null=>false
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
    t.integer  "instructor_id",             :index=>{:name=>"index_course_virtual_classrooms_on_instructor_id", :order=>{:instructor_id=>:asc}}
    t.jsonb    "recorded_videos"
  end

  create_table "courses", force: :cascade do |t|
    t.integer  "instance_id",      :null=>false, :index=>{:name=>"fk__courses_instance_id", :order=>{:instance_id=>:asc}}
    t.string   "title",            :limit=>255, :null=>false
    t.text     "description"
    t.text     "logo"
    t.boolean  "published",        :default=>false, :null=>false
    t.boolean  "enrollable",       :default=>false, :null=>false
    t.string   "registration_key", :limit=>16, :index=>{:name=>"index_courses_on_registration_key", :unique=>true, :order=>{:registration_key=>:asc}}
    t.text     "settings"
    t.boolean  "gamified",         :default=>true, :null=>false
    t.datetime "start_at",         :null=>false
    t.datetime "end_at",           :null=>false
    t.string   "time_zone",        :limit=>255
    t.integer  "creator_id",       :null=>false, :index=>{:name=>"fk__courses_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",       :null=>false, :index=>{:name=>"fk__courses_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",       :null=>false
    t.datetime "updated_at",       :null=>false
  end

  create_table "generic_announcements", force: :cascade do |t|
    t.string   "type",        :limit=>255, :null=>false
    t.integer  "instance_id", :comment=>"The instance this announcement is associated with. This only applies to instance announcements.", :index=>{:name=>"fk__generic_announcements_instance_id", :order=>{:instance_id=>:asc}}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "content"
    t.datetime "start_at",    :null=>false
    t.datetime "end_at",      :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__generic_announcements_creator_id", :order=>{:creator_id=>:asc}}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__generic_announcements_updater_id", :order=>{:updater_id=>:asc}}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "instance_user_role_requests", force: :cascade do |t|
    t.integer  "instance_id",  :null=>false, :index=>{:name=>"fk__instance_user_role_requests_instance_id", :order=>{:instance_id=>:asc}}
    t.integer  "user_id",      :null=>false, :index=>{:name=>"fk__instance_user_role_requests_user_id", :order=>{:user_id=>:asc}}
    t.integer  "role",         :null=>false
    t.string   "organization", :limit=>255
    t.string   "designation",  :limit=>255
    t.text     "reason"
    t.datetime "created_at",   :null=>false
    t.datetime "updated_at",   :null=>false
  end

  create_table "instance_users", force: :cascade do |t|
    t.integer  "instance_id",    :null=>false, :index=>{:name=>"fk__instance_users_instance_id", :order=>{:instance_id=>:asc}}
    t.integer  "user_id",        :null=>false
    t.integer  "role",           :default=>0, :null=>false
    t.datetime "last_active_at"
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false

    t.index ["instance_id", "user_id"], :name=>"index_instance_users_on_instance_id_and_user_id", :unique=>true, :order=>{:instance_id=>:asc, :user_id=>:asc}
  end

  create_table "instances", force: :cascade do |t|
    t.string "name",     :limit=>255, :null=>false
    t.string "host",     :limit=>255, :null=>false, :comment=>"Stores the host name of the instance. The www prefix is automatically handled by the application", :index=>{:name=>"index_instances_on_host", :unique=>true, :case_sensitive=>false}
    t.text   "settings"
  end

  create_table "jobs", id: :uuid, default: nil, force: :cascade do |t|
    t.integer  "status",      :default=>0, :null=>false
    t.string   "redirect_to", :limit=>255
    t.json     "error"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "polyglot_languages", force: :cascade do |t|
    t.string  "type",      :limit=>255, :null=>false, :comment=>"The class of language, as perceived by the application."
    t.string  "name",      :limit=>255, :null=>false, :index=>{:name=>"index_polyglot_languages_on_name", :unique=>true, :case_sensitive=>false}
    t.integer "parent_id", :index=>{:name=>"fk__polyglot_languages_parent_id", :order=>{:parent_id=>:asc}}
  end

  create_table "read_marks", force: :cascade do |t|
    t.integer  "readable_id"
    t.string   "readable_type", :limit=>255, :null=>false
    t.integer  "reader_id",     :null=>false, :index=>{:name=>"read_marks_reader_readable_index", :with=>["reader_type", "readable_type", "readable_id"], :unique=>true, :order=>{:reader_id=>:asc, :reader_type=>:asc, :readable_type=>:asc, :readable_id=>:asc}}
    t.datetime "timestamp"
    t.string   "reader_type",   :limit=>255
  end

  create_table "user_emails", force: :cascade do |t|
    t.boolean  "primary",              :default=>false, :null=>false
    t.integer  "user_id",              :index=>{:name=>"index_user_emails_on_user_id_and_primary", :with=>["primary"], :unique=>true, :where=>"(\"primary\" <> false)"}
    t.string   "email",                :limit=>255, :null=>false, :index=>{:name=>"index_user_emails_on_email", :unique=>true, :case_sensitive=>false}
    t.string   "confirmation_token",   :limit=>255, :index=>{:name=>"index_user_emails_on_confirmation_token", :unique=>true, :order=>{:confirmation_token=>:asc}}
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",    :limit=>255
  end

  create_table "user_identities", force: :cascade do |t|
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__user_identities_user_id", :order=>{:user_id=>:asc}}
    t.string   "provider",   :limit=>255, :null=>false, :index=>{:name=>"index_user_identities_on_provider_and_uid", :with=>["uid"], :unique=>true, :order=>{:provider=>:asc, :uid=>:asc}}
    t.string   "uid",        :limit=>255, :null=>false
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "user_notifications", force: :cascade do |t|
    t.integer  "activity_id",       :null=>false, :index=>{:name=>"index_user_notifications_on_activity_id", :order=>{:activity_id=>:asc}}
    t.integer  "user_id",           :null=>false, :index=>{:name=>"index_user_notifications_on_user_id", :order=>{:user_id=>:asc}}
    t.integer  "notification_type", :default=>0, :null=>false
    t.datetime "created_at",        :null=>false
    t.datetime "updated_at",        :null=>false
  end

  create_table "users", force: :cascade do |t|
    t.string   "name",                   :limit=>255, :null=>false
    t.integer  "role",                   :default=>0, :null=>false
    t.string   "time_zone",              :limit=>255
    t.text     "profile_photo"
    t.string   "encrypted_password",     :limit=>255, :default=>"", :null=>false
    t.string   "reset_password_token",   :limit=>255, :index=>{:name=>"index_users_on_reset_password_token", :unique=>true, :order=>{:reset_password_token=>:asc}}
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default=>0, :null=>false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",             :null=>false
    t.datetime "updated_at",             :null=>false
  end

  add_foreign_key "activities", "users", column: "actor_id", name: "fk_activities_actor_id"
  add_foreign_key "attachment_references", "attachments", name: "fk_attachment_references_attachment_id"
  add_foreign_key "attachment_references", "users", column: "creator_id", name: "fk_attachment_references_creator_id"
  add_foreign_key "attachment_references", "users", column: "updater_id", name: "fk_attachment_references_updater_id"
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
  add_foreign_key "course_assessment_questions_skills", "course_assessment_questions", column: "question_id", name: "fk_course_assessment_questions_skills_question_id"
  add_foreign_key "course_assessment_questions_skills", "course_assessment_skills", column: "skill_id", name: "fk_course_assessment_questions_skills_skill_id"
  add_foreign_key "course_assessment_skill_branches", "courses", name: "fk_course_assessment_skill_branches_course_id"
  add_foreign_key "course_assessment_skill_branches", "users", column: "creator_id", name: "fk_course_assessment_skill_branches_creator_id"
  add_foreign_key "course_assessment_skill_branches", "users", column: "updater_id", name: "fk_course_assessment_skill_branches_updater_id"
  add_foreign_key "course_assessment_skills", "course_assessment_skill_branches", column: "skill_branch_id", name: "fk_course_assessment_skills_skill_branch_id"
  add_foreign_key "course_assessment_skills", "courses", name: "fk_course_assessment_skills_course_id"
  add_foreign_key "course_assessment_skills", "users", column: "creator_id", name: "fk_course_assessment_skills_creator_id"
  add_foreign_key "course_assessment_skills", "users", column: "updater_id", name: "fk_course_assessment_skills_updater_id"
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
  add_foreign_key "course_lesson_plan_milestones", "courses", name: "fk_course_lesson_plan_milestones_course_id"
  add_foreign_key "course_lesson_plan_milestones", "users", column: "creator_id", name: "fk_course_lesson_plan_milestones_creator_id"
  add_foreign_key "course_lesson_plan_milestones", "users", column: "updater_id", name: "fk_course_lesson_plan_milestones_updater_id"
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
  add_foreign_key "course_notifications", "activities", name: "fk_course_notifications_activity_id"
  add_foreign_key "course_notifications", "courses", name: "fk_course_notifications_course_id"
  add_foreign_key "course_question_assessments", "course_assessment_questions", column: "question_id", name: "fk_course_question_assessments_question_id"
  add_foreign_key "course_question_assessments", "course_assessments", column: "assessment_id", name: "fk_course_question_assessments_assessment_id"
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
  add_foreign_key "course_users", "courses", name: "fk_course_users_course_id"
  add_foreign_key "course_users", "users", column: "creator_id", name: "fk_course_users_creator_id"
  add_foreign_key "course_users", "users", column: "updater_id", name: "fk_course_users_updater_id"
  add_foreign_key "course_users", "users", name: "fk_course_users_user_id"
  add_foreign_key "course_video_events", "course_video_sessions", column: "session_id"
  add_foreign_key "course_video_sessions", "course_video_submissions", column: "submission_id"
  add_foreign_key "course_video_sessions", "users", column: "creator_id"
  add_foreign_key "course_video_sessions", "users", column: "updater_id"
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
  add_foreign_key "user_notifications", "activities", name: "fk_user_notifications_activity_id"
  add_foreign_key "user_notifications", "users", name: "fk_user_notifications_user_id"
end
