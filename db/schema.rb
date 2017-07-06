# encoding: UTF-8
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

ActiveRecord::Schema.define(version: 20170706030838) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "users", force: :cascade do |t|
    t.string   "name",                   :limit=>255, :null=>false
    t.integer  "role",                   :default=>0, :null=>false
    t.string   "time_zone",              :limit=>255
    t.text     "profile_photo"
    t.string   "encrypted_password",     :limit=>255, :default=>"", :null=>false
    t.string   "authentication_token",   :limit=>255, :index=>{:name=>"index_users_on_authentication_token", :unique=>true}
    t.string   "reset_password_token",   :limit=>255, :index=>{:name=>"index_users_on_reset_password_token", :unique=>true}
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

  create_table "activities", force: :cascade do |t|
    t.integer  "actor_id",      :null=>false, :index=>{:name=>"fk__activities_actor_id"}, :foreign_key=>{:references=>"users", :name=>"fk_activities_actor_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "object_id",     :null=>false
    t.string   "object_type",   :limit=>255, :null=>false
    t.string   "event",         :limit=>255, :null=>false
    t.string   "notifier_type", :limit=>255, :null=>false
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "attachments", force: :cascade do |t|
    t.string   "name",        :limit=>255, :null=>false, :index=>{:name=>"index_attachments_on_name", :unique=>true}
    t.text     "file_upload", :null=>false
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "attachment_references", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.integer  "attachable_id"
    t.string   "attachable_type", :limit=>255, :index=>{:name=>"fk__attachment_references_attachable_id", :with=>["attachable_id"]}
    t.integer  "attachment_id",   :null=>false, :index=>{:name=>"fk__attachment_references_attachment_id"}, :foreign_key=>{:references=>"attachments", :name=>"fk_attachment_references_attachment_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "name",            :limit=>255, :null=>false
    t.datetime "expires_at"
    t.integer  "creator_id",      :null=>false, :index=>{:name=>"fk__attachment_references_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_attachment_references_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",      :null=>false, :index=>{:name=>"fk__attachment_references_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_attachment_references_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",      :null=>false
    t.datetime "updated_at",      :null=>false
  end

  create_table "instances", force: :cascade do |t|
    t.string "name",     :limit=>255, :null=>false
    t.string "host",     :limit=>255, :null=>false, :comment=>"Stores the host name of the instance. The www prefix is automatically handled by the application", :index=>{:name=>"index_instances_on_host", :unique=>true, :case_sensitive=>false}
    t.text   "settings"
  end

  create_table "courses", force: :cascade do |t|
    t.integer  "instance_id",      :null=>false, :index=>{:name=>"fk__courses_instance_id"}, :foreign_key=>{:references=>"instances", :name=>"fk_courses_instance_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",            :limit=>255, :null=>false
    t.text     "description"
    t.text     "logo"
    t.boolean  "published",        :default=>false, :null=>false
    t.boolean  "enrollable",       :default=>false, :null=>false
    t.string   "registration_key", :limit=>16, :index=>{:name=>"index_courses_on_registration_key", :unique=>true}
    t.text     "settings"
    t.boolean  "gamified",         :default=>true, :null=>false
    t.datetime "start_at",         :null=>false
    t.datetime "end_at",           :null=>false
    t.integer  "creator_id",       :null=>false, :index=>{:name=>"fk__courses_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_courses_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",       :null=>false, :index=>{:name=>"fk__courses_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_courses_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",       :null=>false
    t.datetime "updated_at",       :null=>false
  end

  create_table "course_achievements", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_achievements_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_achievements_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.text     "badge"
    t.integer  "weight",      :null=>false
    t.boolean  "published",   :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_achievements_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_achievements_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_achievements_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_achievements_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_announcements", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_announcements_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_announcements_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",      :limit=>255, :null=>false
    t.text     "content"
    t.boolean  "sticky",     :default=>false, :null=>false
    t.datetime "start_at",   :null=>false
    t.datetime "end_at",     :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_announcements_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_announcements_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_announcements_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_announcements_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_assessment_categories", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_assessment_categories_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_assessment_categories_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",      :limit=>255, :null=>false
    t.integer  "weight",     :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_assessment_categories_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_categories_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_assessment_categories_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_categories_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_assessment_tabs", force: :cascade do |t|
    t.integer  "category_id", :null=>false, :index=>{:name=>"fk__course_assessment_tabs_category_id"}, :foreign_key=>{:references=>"course_assessment_categories", :name=>"fk_course_assessment_tabs_category_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",       :limit=>255, :null=>false
    t.integer  "weight",      :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_assessment_tabs_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_tabs_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_assessment_tabs_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_tabs_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_assessments", force: :cascade do |t|
    t.integer  "tab_id",                    :null=>false, :index=>{:name=>"fk__course_assessments_tab_id"}, :foreign_key=>{:references=>"course_assessment_tabs", :name=>"fk_course_assessments_tab_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.boolean  "tabbed_view",               :default=>false, :null=>false
    t.boolean  "autograded",                :null=>false
    t.boolean  "show_private",              :default=>false, :comment=>"Show private test cases  after students answer correctly"
    t.boolean  "show_evaluation",           :default=>false, :comment=>"Show evaluation test cases after after students answer correctly"
    t.boolean  "skippable",                 :default=>false
    t.boolean  "delayed_grade_publication", :default=>false
    t.string   "password",                  :limit=>255
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_assessments_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessments_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_assessments_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessments_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
  end

  create_table "course_assessment_questions", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",        :limit=>255, :index=>{:name=>"index_course_assessment_questions_actable", :with=>["actable_id"], :unique=>true}
    t.integer  "assessment_id",       :null=>false, :index=>{:name=>"fk__course_assessment_questions_assessment_id"}, :foreign_key=>{:references=>"course_assessments", :name=>"fk_course_assessment_questions_assessment_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",               :limit=>255
    t.text     "description"
    t.text     "staff_only_comments"
    t.decimal  "maximum_grade",       :precision=>4, :scale=>1, :null=>false
    t.integer  "weight",              :null=>false
    t.integer  "creator_id",          :null=>false, :index=>{:name=>"fk__course_assessment_questions_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_questions_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",          :null=>false, :index=>{:name=>"fk__course_assessment_questions_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_questions_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",          :null=>false
    t.datetime "updated_at",          :null=>false
  end

  create_table "course_assessment_submissions", force: :cascade do |t|
    t.integer  "assessment_id",  :null=>false, :index=>{:name=>"fk__course_assessment_submissions_assessment_id"}, :foreign_key=>{:references=>"course_assessments", :name=>"fk_course_assessment_submissions_assessment_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "workflow_state", :limit=>255, :null=>false
    t.string   "session_id",     :limit=>255
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_assessment_submissions_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_submissions_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_assessment_submissions_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_submissions_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
    t.integer  "publisher_id",   :index=>{:name=>"fk__course_assessment_submissions_publisher_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_submissions_publisher_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "published_at"
    t.datetime "submitted_at"
  end
  add_index "course_assessment_submissions", ["assessment_id", "creator_id"], :name=>"unique_assessment_id_and_creator_id", :unique=>true

  create_table "course_assessment_answers", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",   :limit=>255, :index=>{:name=>"index_course_assessment_answers_actable", :with=>["actable_id"], :unique=>true}
    t.integer  "submission_id",  :null=>false, :index=>{:name=>"fk__course_assessment_answers_submission_id"}, :foreign_key=>{:references=>"course_assessment_submissions", :name=>"fk_course_assessment_answers_submission_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "question_id",    :null=>false, :index=>{:name=>"fk__course_assessment_answers_question_id"}, :foreign_key=>{:references=>"course_assessment_questions", :name=>"fk_course_assessment_answers_question_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "workflow_state", :limit=>255, :null=>false
    t.datetime "submitted_at"
    t.decimal  "grade",          :precision=>4, :scale=>1
    t.boolean  "correct",        :comment=>"Correctness is independent of the grade (depends on the grading schema)"
    t.integer  "grader_id",      :index=>{:name=>"fk__course_assessment_answers_grader_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_answers_grader_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "graded_at"
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
  end

  create_table "jobs", id: :uuid, default: nil, force: :cascade do |t|
    t.integer  "status",      :default=>0, :null=>false
    t.string   "redirect_to", :limit=>255
    t.json     "error"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "course_assessment_answer_auto_gradings", force: :cascade do |t|
    t.integer  "actable_id",   :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_actable", :with=>["actable_type"], :unique=>true}
    t.string   "actable_type", :limit=>255
    t.integer  "answer_id",    :null=>false, :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_answer_id", :unique=>true}, :foreign_key=>{:references=>"course_assessment_answers", :name=>"fk_course_assessment_answer_auto_gradings_answer_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.uuid     "job_id",       :index=>{:name=>"index_course_assessment_answer_auto_gradings_on_job_id", :unique=>true}, :foreign_key=>{:references=>"jobs", :name=>"fk_course_assessment_answer_auto_gradings_job_id", :on_update=>:no_action, :on_delete=>:nullify}
    t.json     "result"
    t.datetime "created_at",   :null=>false
    t.datetime "updated_at",   :null=>false
  end

  create_table "course_assessment_answer_multiple_responses", force: :cascade do |t|
  end

  create_table "course_assessment_question_multiple_responses", force: :cascade do |t|
    t.integer "grading_scheme", :default=>0, :null=>false
  end

  create_table "course_assessment_question_multiple_response_options", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_question"}, :foreign_key=>{:references=>"course_assessment_question_multiple_responses", :name=>"fk_course_assessment_question_multiple_response_options_questio", :on_update=>:no_action, :on_delete=>:no_action}
    t.boolean "correct",     :null=>false
    t.text    "option",      :null=>false
    t.text    "explanation"
    t.integer "weight",      :null=>false
  end

  create_table "course_assessment_answer_multiple_response_options", force: :cascade do |t|
    t.integer "answer_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_answer"}, :foreign_key=>{:references=>"course_assessment_answer_multiple_responses", :name=>"fk_course_assessment_answer_multiple_response_options_answer_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "option_id", :null=>false, :index=>{:name=>"fk__course_assessment_multiple_response_option_question_option"}, :foreign_key=>{:references=>"course_assessment_question_multiple_response_options", :name=>"fk_course_assessment_answer_multiple_response_options_option_id", :on_update=>:no_action, :on_delete=>:no_action}
  end
  add_index "course_assessment_answer_multiple_response_options", ["answer_id", "option_id"], :name=>"index_multiple_response_answer_on_answer_id_and_option_id", :unique=>true

  create_table "course_assessment_answer_programming", force: :cascade do |t|
  end

  create_table "course_assessment_answer_programming_auto_gradings", force: :cascade do |t|
    t.text    "stdout"
    t.text    "stderr"
    t.integer "exit_code"
  end

  create_table "polyglot_languages", force: :cascade do |t|
    t.string  "type",      :limit=>255, :null=>false, :comment=>"The class of language, as perceived by the application."
    t.string  "name",      :limit=>255, :null=>false, :index=>{:name=>"index_polyglot_languages_on_name", :unique=>true, :case_sensitive=>false}
    t.integer "parent_id", :index=>{:name=>"fk__polyglot_languages_parent_id"}, :foreign_key=>{:references=>"polyglot_languages", :name=>"fk_polyglot_languages_parent_id", :on_update=>:no_action, :on_delete=>:no_action}
  end

  create_table "course_assessment_question_programming", force: :cascade do |t|
    t.integer "language_id",   :null=>false, :index=>{:name=>"fk__course_assessment_question_programming_language_id"}, :foreign_key=>{:references=>"polyglot_languages", :name=>"fk_course_assessment_question_programming_language_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "memory_limit",  :comment=>"Memory limit, in MiB"
    t.integer "time_limit",    :comment=>"Time limit, in seconds"
    t.integer "attempt_limit"
    t.uuid    "import_job_id", :comment=>"The ID of the importing job", :index=>{:name=>"index_course_assessment_question_programming_on_import_job_id", :unique=>true}, :foreign_key=>{:references=>"jobs", :name=>"fk_course_assessment_question_programming_import_job_id", :on_update=>:no_action, :on_delete=>:nullify}
    t.integer "package_type",  :default=>0, :null=>false
  end

  create_table "course_assessment_question_programming_test_cases", force: :cascade do |t|
    t.integer "question_id",    :null=>false, :index=>{:name=>"fk__course_assessment_quest_18b37224652fc59d955122a17ba20d07"}, :foreign_key=>{:references=>"course_assessment_question_programming", :name=>"fk_course_assessment_questi_ee00a2daf4389c4c2ddba3041a15c35f", :on_update=>:no_action, :on_delete=>:no_action}
    t.string  "identifier",     :limit=>255, :null=>false, :comment=>"Test case identifier generated by the testing framework", :index=>{:name=>"index_course_assessment_question_programming_test_case_ident", :with=>["question_id"], :unique=>true}
    t.integer "test_case_type", :null=>false
    t.text    "expression"
    t.text    "expected"
    t.text    "hint"
  end

  create_table "course_assessment_answer_programming_auto_grading_test_results", force: :cascade do |t|
    t.integer "auto_grading_id", :null=>false, :index=>{:name=>"fk__course_assessment_answe_57b22f114b54911fd4e1519680ebfd49"}, :foreign_key=>{:references=>"course_assessment_answer_programming_auto_gradings", :name=>"fk_course_assessment_answer_e3d785447112439bb306849be8690102", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "test_case_id",    :index=>{:name=>"fk__course_assessment_answe_29a2568d5e2fb3a47c0561815786f9ab"}, :foreign_key=>{:references=>"course_assessment_question_programming_test_cases", :name=>"fk_course_assessment_answer_bbb492885b1e3dca4433b8af8cb95906", :on_update=>:no_action, :on_delete=>:no_action}
    t.boolean "passed",          :null=>false
    t.jsonb   "messages",        :default=>{}, :null=>false
  end

  create_table "course_assessment_answer_programming_files", force: :cascade do |t|
    t.integer "answer_id", :null=>false, :index=>{:name=>"fk__course_assessment_answer_programming_files_answer_id"}, :foreign_key=>{:references=>"course_assessment_answer_programming", :name=>"fk_course_assessment_answer_programming_files_answer_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string  "filename",  :limit=>255, :null=>false
    t.text    "content",   :default=>"", :null=>false
  end
  add_index "course_assessment_answer_programming_files", ["answer_id", "filename"], :name=>"index_course_assessment_answer_programming_files_filename", :unique=>true, :case_sensitive=>false

  create_table "course_assessment_answer_programming_file_annotations", force: :cascade do |t|
    t.integer "file_id", :null=>false, :index=>{:name=>"fk__course_assessment_answe_09c4b638af92d0f8252d7cdef59bd6f3"}, :foreign_key=>{:references=>"course_assessment_answer_programming_files", :name=>"fk_course_assessment_answer_ed21459e7a2a5034dcf43a14812cb17d", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "line",    :null=>false
  end

  create_table "course_assessment_answer_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_answer_scribing_scribbles", force: :cascade do |t|
    t.text     "content"
    t.integer  "answer_id",  :index=>{:name=>"fk__course_assessment_answer_scribing_scribbles_scribing_answer"}, :foreign_key=>{:references=>"course_assessment_answer_scribings", :name=>"fk_course_assessment_answer_scribing_scribbles_answer_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_assessment_answer_scribing_scribbles_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_answer_scribing_scribbles_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_assessment_answer_text_responses", force: :cascade do |t|
    t.text "answer_text"
  end

  create_table "course_assessment_question_programming_template_files", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_assessment_quest_dbf3aed51f19fcc63a25d296a057dd1f"}, :foreign_key=>{:references=>"course_assessment_question_programming", :name=>"fk_course_assessment_questi_0788633b496294e558f55f2b41bc7c45", :on_update=>:no_action, :on_delete=>:no_action}
    t.string  "filename",    :limit=>255, :null=>false
    t.text    "content",     :null=>false
  end
  add_index "course_assessment_question_programming_template_files", ["question_id", "filename"], :name=>"index_course_assessment_question_programming_template_filenames", :unique=>true, :case_sensitive=>false

  create_table "course_assessment_question_scribings", force: :cascade do |t|
  end

  create_table "course_assessment_question_text_responses", force: :cascade do |t|
    t.boolean "allow_attachment", :default=>false
    t.boolean "hide_text",        :default=>false
  end

  create_table "course_assessment_question_text_response_solutions", force: :cascade do |t|
    t.integer "question_id",   :null=>false, :index=>{:name=>"fk__course_assessment_text_response_solution_question"}, :foreign_key=>{:references=>"course_assessment_question_text_responses", :name=>"fk_course_assessment_questi_2fbeabfad04f21c2d05c8b2d9100d1c4", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "solution_type", :default=>0, :null=>false
    t.text    "solution",      :null=>false
    t.decimal "grade",         :precision=>4, :scale=>1, :default=>0.0, :null=>false
    t.text    "explanation"
  end

  create_table "course_assessment_skill_branches", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_assessment_skill_branches_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_skill_branches_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_assessment_skill_branches_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_skill_branches_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_assessment_skills", force: :cascade do |t|
    t.integer  "course_id",       :null=>false, :index=>{:name=>"fk__course_assessment_skills_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_assessment_skills_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "skill_branch_id", :index=>{:name=>"fk__course_assessment_skills_skill_branch_id"}, :foreign_key=>{:references=>"course_assessment_skill_branches", :name=>"fk_course_assessment_skills_skill_branch_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",           :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",      :null=>false, :index=>{:name=>"fk__course_assessment_skills_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_skills_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",      :null=>false, :index=>{:name=>"fk__course_assessment_skills_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_assessment_skills_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",      :null=>false
    t.datetime "updated_at",      :null=>false
  end

  create_table "course_assessment_questions_skills", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"course_assessment_question_skills_question_index"}, :foreign_key=>{:references=>"course_assessment_questions", :name=>"fk_course_assessment_questions_skills_question_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "skill_id",    :null=>false, :index=>{:name=>"course_assessment_question_skills_skill_index"}, :foreign_key=>{:references=>"course_assessment_skills", :name=>"fk_course_assessment_questions_skills_skill_id", :on_update=>:no_action, :on_delete=>:no_action}
  end

  create_table "course_assessment_submission_logs", force: :cascade do |t|
    t.integer  "submission_id", :null=>false, :index=>{:name=>"fk__course_assessment_submission_logs_submission_id"}, :foreign_key=>{:references=>"course_assessment_submissions", :name=>"fk_course_assessment_submission_logs_submission_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.jsonb    "request"
    t.datetime "created_at",    :null=>false
  end

  create_table "course_assessment_submission_questions", force: :cascade do |t|
    t.integer  "submission_id", :null=>false, :index=>{:name=>"fk__course_assessment_submission_questions_submission_id"}, :foreign_key=>{:references=>"course_assessment_submissions", :name=>"fk_course_assessment_submission_questions_submission_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "question_id",   :null=>false, :index=>{:name=>"fk__course_assessment_submission_questions_question_id"}, :foreign_key=>{:references=>"course_assessment_questions", :name=>"fk_course_assessment_submission_questions_question_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end
  add_index "course_assessment_submission_questions", ["submission_id", "question_id"], :name=>"idx_course_assessment_submission_questions_on_sub_and_qn", :unique=>true

  create_table "course_condition_achievements", force: :cascade do |t|
    t.integer "achievement_id", :null=>false, :index=>{:name=>"fk__course_condition_achievements_achievement_id"}, :foreign_key=>{:references=>"course_achievements", :name=>"fk_course_condition_achievements_achievement_id", :on_update=>:no_action, :on_delete=>:no_action}
  end

  create_table "course_condition_assessments", force: :cascade do |t|
    t.integer "assessment_id",            :null=>false, :index=>{:name=>"fk__course_condition_assessments_assessment_id"}, :foreign_key=>{:references=>"course_assessments", :name=>"fk_course_condition_assessments_assessment_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.float   "minimum_grade_percentage"
  end

  create_table "course_condition_levels", force: :cascade do |t|
    t.integer "minimum_level", :null=>false
  end

  create_table "course_conditions", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",     :limit=>255, :index=>{:name=>"index_course_conditions_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true}
    t.integer  "course_id",        :null=>false, :index=>{:name=>"fk__course_conditions_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_conditions_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "conditional_id",   :null=>false
    t.string   "conditional_type", :limit=>255, :null=>false, :index=>{:name=>"index_course_conditions_on_conditional_type_and_conditional_id", :with=>["conditional_id"]}
    t.integer  "creator_id",       :null=>false, :index=>{:name=>"fk__course_conditions_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_conditions_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",       :null=>false, :index=>{:name=>"fk__course_conditions_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_conditions_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",       :null=>false
    t.datetime "updated_at",       :null=>false
  end

  create_table "course_discussion_topics", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",        :limit=>255, :index=>{:name=>"index_course_discussion_topics_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true}
    t.integer  "course_id",           :null=>false, :index=>{:name=>"fk__course_discussion_topics_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_discussion_topics_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.boolean  "pending_staff_reply", :default=>false, :null=>false
    t.datetime "created_at",          :null=>false
    t.datetime "updated_at",          :null=>false
  end

  create_table "course_discussion_posts", force: :cascade do |t|
    t.integer  "parent_id",  :index=>{:name=>"fk__course_discussion_posts_parent_id"}, :foreign_key=>{:references=>"course_discussion_posts", :name=>"fk_course_discussion_posts_parent_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "topic_id",   :null=>false, :index=>{:name=>"fk__course_discussion_posts_topic_id"}, :foreign_key=>{:references=>"course_discussion_topics", :name=>"fk_course_discussion_posts_topic_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",      :limit=>255
    t.text     "text"
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_discussion_posts_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_discussion_posts_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_discussion_posts_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_discussion_posts_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_discussion_post_votes", force: :cascade do |t|
    t.integer  "post_id",    :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_post_id"}, :foreign_key=>{:references=>"course_discussion_posts", :name=>"fk_course_discussion_post_votes_post_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.boolean  "vote_flag",  :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_discussion_post_votes_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_discussion_post_votes_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_discussion_post_votes_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end
  add_index "course_discussion_post_votes", ["post_id", "creator_id"], :name=>"index_course_discussion_post_votes_on_post_id_and_creator_id", :unique=>true

  create_table "course_discussion_topic_subscriptions", force: :cascade do |t|
    t.integer "topic_id", :null=>false, :index=>{:name=>"fk__course_discussion_topic_subscriptions_topic_id"}, :foreign_key=>{:references=>"course_discussion_topics", :name=>"fk_course_discussion_topic_subscriptions_topic_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "user_id",  :null=>false, :index=>{:name=>"fk__course_discussion_topic_subscriptions_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_discussion_topic_subscriptions_user_id", :on_update=>:no_action, :on_delete=>:no_action}
  end
  add_index "course_discussion_topic_subscriptions", ["topic_id", "user_id"], :name=>"index_topic_subscriptions_on_topic_id_and_user_id", :unique=>true

  create_table "course_enrol_requests", force: :cascade do |t|
    t.integer  "course_id",  :null=>false, :index=>{:name=>"fk__course_enrol_requests_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_enrol_requests_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__course_enrol_requests_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_enrol_requests_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at"
    t.datetime "updated_at"
  end
  add_index "course_enrol_requests", ["course_id", "user_id"], :name=>"index_course_enrol_requests_on_course_id_and_user_id", :unique=>true

  create_table "course_users", force: :cascade do |t|
    t.integer  "course_id",      :null=>false, :index=>{:name=>"fk__course_users_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_users_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",        :null=>false, :index=>{:name=>"fk__course_users_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_users_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "role",           :default=>0, :null=>false
    t.string   "name",           :limit=>255, :null=>false
    t.boolean  "phantom",        :default=>false, :null=>false
    t.datetime "last_active_at"
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_users_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_users_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_users_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_users_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
  end
  add_index "course_users", ["course_id", "user_id"], :name=>"index_course_users_on_course_id_and_user_id", :unique=>true

  create_table "course_experience_points_records", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",         :limit=>255, :index=>{:name=>"index_course_experience_points_records_on_actable", :with=>["actable_id"], :unique=>true}
    t.integer  "draft_points_awarded"
    t.integer  "points_awarded"
    t.integer  "course_user_id",       :null=>false, :index=>{:name=>"fk__course_experience_points_records_course_user_id"}, :foreign_key=>{:references=>"course_users", :name=>"fk_course_experience_points_records_course_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "reason",               :limit=>255
    t.integer  "creator_id",           :null=>false, :index=>{:name=>"fk__course_experience_points_records_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_experience_points_records_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",           :null=>false, :index=>{:name=>"fk__course_experience_points_records_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_experience_points_records_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",           :null=>false
    t.datetime "updated_at",           :null=>false
    t.integer  "awarder_id",           :index=>{:name=>"fk__course_experience_points_records_awarder_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_experience_points_records_awarder_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "awarded_at"
  end

  create_table "course_forums", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_forums_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_forums_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "name",        :limit=>255, :null=>false
    t.string   "slug",        :limit=>255
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_forums_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forums_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_forums_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forums_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end
  add_index "course_forums", ["course_id", "slug"], :name=>"index_course_forums_on_course_id_and_slug", :unique=>true

  create_table "course_forum_subscriptions", force: :cascade do |t|
    t.integer "forum_id", :null=>false, :index=>{:name=>"fk__course_forum_subscriptions_forum_id"}, :foreign_key=>{:references=>"course_forums", :name=>"fk_course_forum_subscriptions_forum_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "user_id",  :null=>false, :index=>{:name=>"fk__course_forum_subscriptions_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forum_subscriptions_user_id", :on_update=>:no_action, :on_delete=>:no_action}
  end
  add_index "course_forum_subscriptions", ["forum_id", "user_id"], :name=>"index_course_forum_subscriptions_on_forum_id_and_user_id", :unique=>true

  create_table "course_forum_topics", force: :cascade do |t|
    t.integer  "forum_id",   :null=>false, :index=>{:name=>"fk__course_forum_topics_forum_id"}, :foreign_key=>{:references=>"course_forums", :name=>"fk_course_forum_topics_forum_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",      :limit=>255, :null=>false
    t.string   "slug",       :limit=>255
    t.boolean  "locked",     :default=>false
    t.boolean  "hidden",     :default=>false
    t.integer  "topic_type", :default=>0
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_forum_topics_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forum_topics_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_forum_topics_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forum_topics_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end
  add_index "course_forum_topics", ["forum_id", "slug"], :name=>"index_course_forum_topics_on_forum_id_and_slug", :unique=>true

  create_table "course_forum_topic_views", force: :cascade do |t|
    t.integer  "topic_id",   :null=>false, :index=>{:name=>"fk__course_forum_topic_views_topic_id"}, :foreign_key=>{:references=>"course_forum_topics", :name=>"fk_course_forum_topic_views_topic_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__course_forum_topic_views_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_forum_topic_views_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_groups", force: :cascade do |t|
    t.integer  "course_id",   :null=>false, :index=>{:name=>"fk__course_groups_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_groups_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "name",        :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_groups_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_groups_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_groups_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_groups_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end
  add_index "course_groups", ["course_id", "name"], :name=>"index_course_groups_on_course_id_and_name", :unique=>true

  create_table "course_group_users", force: :cascade do |t|
    t.integer  "group_id",       :null=>false, :index=>{:name=>"fk__course_group_users_course_group_id"}, :foreign_key=>{:references=>"course_groups", :name=>"fk_course_group_users_course_group_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "course_user_id", :null=>false, :index=>{:name=>"fk__course_group_users_course_user_id"}, :foreign_key=>{:references=>"course_users", :name=>"fk_course_group_users_course_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "role",           :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_group_users_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_group_users_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_group_users_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_group_users_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
  end
  add_index "course_group_users", ["course_user_id", "group_id"], :name=>"index_course_group_users_on_course_user_id_and_course_group_id", :unique=>true

  create_table "course_lesson_plan_events", force: :cascade do |t|
    t.string  "location",   :limit=>255
    t.integer "event_type", :default=>0, :null=>false
  end

  create_table "course_material_folders", force: :cascade do |t|
    t.integer  "parent_id",          :index=>{:name=>"fk__course_material_folders_parent_id"}, :foreign_key=>{:references=>"course_material_folders", :name=>"fk_course_material_folders_parent_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "course_id",          :null=>false, :index=>{:name=>"fk__course_material_folders_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_material_folders_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "owner_id",           :index=>{:name=>"index_course_material_folders_on_owner_id_and_owner_type", :with=>["owner_type"], :unique=>true}
    t.string   "owner_type",         :limit=>255, :index=>{:name=>"fk__course_material_folders_owner_id", :with=>["owner_id"]}
    t.string   "name",               :limit=>255, :null=>false
    t.text     "description"
    t.boolean  "can_student_upload", :default=>false, :null=>false
    t.datetime "start_at",           :null=>false
    t.datetime "end_at"
    t.integer  "creator_id",         :null=>false, :index=>{:name=>"fk__course_material_folders_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_material_folders_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",         :null=>false, :index=>{:name=>"fk__course_material_folders_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_material_folders_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",         :null=>false
    t.datetime "updated_at",         :null=>false
  end
  add_index "course_material_folders", ["parent_id", "name"], :name=>"index_course_material_folders_on_parent_id_and_name", :unique=>true, :case_sensitive=>false

  create_table "course_materials", force: :cascade do |t|
    t.integer  "folder_id",   :null=>false, :index=>{:name=>"fk__course_materials_folder_id"}, :foreign_key=>{:references=>"course_material_folders", :name=>"fk_course_materials_folder_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "name",        :limit=>255, :null=>false
    t.text     "description"
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_materials_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_materials_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_materials_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_materials_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end
  add_index "course_materials", ["folder_id", "name"], :name=>"index_course_materials_on_folder_id_and_name", :unique=>true, :case_sensitive=>false

  create_table "course_lesson_plan_event_materials", force: :cascade do |t|
    t.integer "lesson_plan_event_id", :null=>false, :index=>{:name=>"fk__course_lesson_plan_event_materials_lesson_plan_event_id"}, :foreign_key=>{:references=>"course_lesson_plan_events", :name=>"fk_course_lesson_plan_event_materials_lesson_plan_event_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "material_id",          :null=>false, :index=>{:name=>"fk__course_lesson_plan_event_materials_material_id"}, :foreign_key=>{:references=>"course_materials", :name=>"fk_course_lesson_plan_event_materials_material_id", :on_update=>:no_action, :on_delete=>:no_action}
  end

  create_table "course_lesson_plan_items", force: :cascade do |t|
    t.integer  "actable_id"
    t.string   "actable_type",           :limit=>255, :index=>{:name=>"index_course_lesson_plan_items_on_actable_type_and_actable_id", :with=>["actable_id"], :unique=>true}
    t.integer  "course_id",              :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_lesson_plan_items_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",                  :limit=>255, :null=>false
    t.text     "description"
    t.boolean  "published",              :default=>false, :null=>false
    t.integer  "base_exp",               :null=>false
    t.integer  "time_bonus_exp",         :null=>false
    t.datetime "start_at",               :null=>false
    t.datetime "bonus_end_at"
    t.datetime "end_at"
    t.float    "opening_reminder_token"
    t.float    "closing_reminder_token"
    t.integer  "creator_id",             :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_items_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",             :null=>false, :index=>{:name=>"fk__course_lesson_plan_items_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_items_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",             :null=>false
    t.datetime "updated_at",             :null=>false
  end

  create_table "course_lesson_plan_milestones", force: :cascade do |t|
    t.integer  "course_id",   :index=>{:name=>"fk__course_lesson_plan_milestones_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_lesson_plan_milestones_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "description"
    t.datetime "start_at",    :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__course_lesson_plan_milestones_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_milestones_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__course_lesson_plan_milestones_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_milestones_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "course_lesson_plan_todos", force: :cascade do |t|
    t.integer  "item_id",        :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_item_id"}, :foreign_key=>{:references=>"course_lesson_plan_items", :name=>"fk_course_lesson_plan_todos_item_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",        :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_todos_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "workflow_state", :limit=>255, :null=>false
    t.boolean  "ignore",         :default=>false, :null=>false
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_todos_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_lesson_plan_todos_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_lesson_plan_todos_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at"
    t.datetime "updated_at"
  end
  add_index "course_lesson_plan_todos", ["item_id", "user_id"], :name=>"index_course_lesson_plan_todos_on_item_id_and_user_id", :unique=>true

  create_table "course_levels", force: :cascade do |t|
    t.integer  "course_id",                   :null=>false, :index=>{:name=>"fk__course_levels_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_levels_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "experience_points_threshold", :null=>false
    t.datetime "created_at",                  :null=>false
    t.datetime "updated_at",                  :null=>false
  end
  add_index "course_levels", ["course_id", "experience_points_threshold"], :name=>"index_experience_points_threshold_on_course_id", :unique=>true

  create_table "course_notifications", force: :cascade do |t|
    t.integer  "activity_id",       :null=>false, :index=>{:name=>"index_course_notifications_on_activity_id"}, :foreign_key=>{:references=>"activities", :name=>"fk_course_notifications_activity_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "course_id",         :null=>false, :index=>{:name=>"index_course_notifications_on_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_notifications_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "notification_type", :default=>0, :null=>false
    t.datetime "created_at",        :null=>false
    t.datetime "updated_at",        :null=>false
  end

  create_table "course_surveys", force: :cascade do |t|
    t.boolean  "anonymous",                 :default=>false, :null=>false
    t.boolean  "allow_modify_after_submit", :default=>false, :null=>false
    t.boolean  "allow_response_after_end",  :default=>false, :null=>false
    t.datetime "closing_reminded_at"
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_surveys_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_surveys_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_surveys_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_surveys_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
  end

  create_table "course_survey_sections", force: :cascade do |t|
    t.integer "survey_id",   :null=>false, :index=>{:name=>"fk__course_survey_sections_survey_id"}, :foreign_key=>{:references=>"course_surveys", :name=>"fk_course_survey_sections_survey_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string  "title",       :limit=>255, :null=>false
    t.text    "description"
    t.integer "weight",      :null=>false
  end

  create_table "course_survey_questions", force: :cascade do |t|
    t.integer  "section_id",    :null=>false, :index=>{:name=>"index_course_survey_questions_on_section_id"}, :foreign_key=>{:references=>"course_survey_sections", :name=>"fk_course_survey_questions_section_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "question_type", :default=>0, :null=>false
    t.text     "description",   :null=>false
    t.integer  "weight",        :null=>false
    t.boolean  "required",      :default=>false, :null=>false
    t.boolean  "grid_view",     :default=>false, :null=>false
    t.integer  "max_options"
    t.integer  "min_options"
    t.integer  "creator_id",    :null=>false, :index=>{:name=>"fk__course_survey_questions_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_questions_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",    :null=>false, :index=>{:name=>"fk__course_survey_questions_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_questions_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "course_survey_responses", force: :cascade do |t|
    t.integer  "survey_id",    :null=>false, :index=>{:name=>"fk__course_survey_responses_survey_id"}, :foreign_key=>{:references=>"course_surveys", :name=>"fk_course_survey_responses_survey_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "submitted_at"
    t.integer  "creator_id",   :null=>false, :index=>{:name=>"fk__course_survey_responses_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_responses_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",   :null=>false, :index=>{:name=>"fk__course_survey_responses_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_responses_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",   :null=>false
    t.datetime "updated_at",   :null=>false
  end
  add_index "course_survey_responses", ["survey_id", "creator_id"], :name=>"index_course_survey_responses_on_survey_id_and_creator_id", :unique=>true

  create_table "course_survey_answers", force: :cascade do |t|
    t.integer  "question_id",   :null=>false, :index=>{:name=>"fk__course_survey_answers_question_id"}, :foreign_key=>{:references=>"course_survey_questions", :name=>"fk_course_survey_answers_question_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "response_id",   :null=>false, :index=>{:name=>"fk__course_survey_answers_response_id"}, :foreign_key=>{:references=>"course_survey_responses", :name=>"fk_course_survey_answers_response_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.text     "text_response"
    t.integer  "creator_id",    :null=>false, :index=>{:name=>"fk__course_survey_answers_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_answers_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",    :null=>false, :index=>{:name=>"fk__course_survey_answers_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_survey_answers_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",    :null=>false
    t.datetime "updated_at",    :null=>false
  end

  create_table "course_survey_question_options", force: :cascade do |t|
    t.integer "question_id", :null=>false, :index=>{:name=>"fk__course_survey_question_options_question_id"}, :foreign_key=>{:references=>"course_survey_questions", :name=>"fk_course_survey_question_options_question_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.text    "option"
    t.integer "weight",      :null=>false
  end

  create_table "course_survey_answer_options", force: :cascade do |t|
    t.integer "answer_id",          :null=>false, :index=>{:name=>"fk__course_survey_answer_options_answer_id"}, :foreign_key=>{:references=>"course_survey_answers", :name=>"fk_course_survey_answer_options_answer_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer "question_option_id", :null=>false, :index=>{:name=>"fk__course_survey_answer_options_question_option_id"}, :foreign_key=>{:references=>"course_survey_question_options", :name=>"fk_course_survey_answer_options_question_option_id", :on_update=>:no_action, :on_delete=>:no_action}
  end

  create_table "course_user_achievements", force: :cascade do |t|
    t.integer  "course_user_id", :index=>{:name=>"fk__course_user_achievements_course_user_id"}, :foreign_key=>{:references=>"course_users", :name=>"fk_course_user_achievements_course_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "achievement_id", :index=>{:name=>"fk__course_user_achievements_achievement_id"}, :foreign_key=>{:references=>"course_achievements", :name=>"fk_course_user_achievements_achievement_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "obtained_at",    :null=>false
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
  end
  add_index "course_user_achievements", ["course_user_id", "achievement_id"], :name=>"index_user_achievements_on_course_user_id_and_achievement_id", :unique=>true

  create_table "course_user_invitations", force: :cascade do |t|
    t.integer  "course_id",      :null=>false, :index=>{:name=>"fk__course_user_invitations_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_user_invitations_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "name",           :limit=>255, :null=>false
    t.string   "email",          :limit=>255, :null=>false, :index=>{:name=>"index_course_user_invitations_on_email", :case_sensitive=>false}
    t.string   "invitation_key", :limit=>32, :null=>false, :index=>{:name=>"index_course_user_invitations_on_invitation_key", :unique=>true}
    t.datetime "sent_at"
    t.datetime "confirmed_at"
    t.integer  "creator_id",     :null=>false, :index=>{:name=>"fk__course_user_invitations_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_user_invitations_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",     :null=>false, :index=>{:name=>"fk__course_user_invitations_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_user_invitations_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",     :null=>false
    t.datetime "updated_at",     :null=>false
  end
  add_index "course_user_invitations", ["course_id", "email"], :name=>"index_course_user_invitations_on_course_id_and_email", :unique=>true

  create_table "course_videos", force: :cascade do |t|
    t.string   "url",        :limit=>255, :null=>false
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_videos_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_videos_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_videos_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_videos_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "course_video_submissions", force: :cascade do |t|
    t.integer  "video_id",   :null=>false, :index=>{:name=>"fk__course_video_submissions_video_id"}, :foreign_key=>{:references=>"course_videos", :name=>"fk_course_video_submissions_video_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "creator_id", :null=>false, :index=>{:name=>"fk__course_video_submissions_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_video_submissions_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id", :null=>false, :index=>{:name=>"fk__course_video_submissions_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_video_submissions_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end
  add_index "course_video_submissions", ["video_id", "creator_id"], :name=>"index_course_video_submissions_on_video_id_and_creator_id", :unique=>true

  create_table "course_virtual_classrooms", force: :cascade do |t|
    t.integer  "course_id",                 :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_course_id"}, :foreign_key=>{:references=>"courses", :name=>"fk_course_virtual_classrooms_course_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.text     "instructor_classroom_link"
    t.integer  "classroom_id"
    t.string   "title",                     :limit=>255, :null=>false
    t.text     "content"
    t.datetime "start_at",                  :null=>false
    t.datetime "end_at",                    :null=>false
    t.integer  "creator_id",                :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_virtual_classrooms_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",                :null=>false, :index=>{:name=>"fk__course_virtual_classrooms_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_virtual_classrooms_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",                :null=>false
    t.datetime "updated_at",                :null=>false
    t.integer  "instructor_id",             :index=>{:name=>"index_course_virtual_classrooms_on_instructor_id"}, :foreign_key=>{:references=>"users", :name=>"fk_course_virtual_classrooms_instructor_id", :on_update=>:cascade, :on_delete=>:nullify}
    t.jsonb    "recorded_videos"
  end

  create_table "generic_announcements", force: :cascade do |t|
    t.string   "type",        :limit=>255, :null=>false
    t.integer  "instance_id", :comment=>"The instance this announcement is associated with. This only applies to instance announcements.", :index=>{:name=>"fk__generic_announcements_instance_id"}, :foreign_key=>{:references=>"instances", :name=>"fk_generic_announcements_instance_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "title",       :limit=>255, :null=>false
    t.text     "content"
    t.datetime "start_at",    :null=>false
    t.datetime "end_at",      :null=>false
    t.integer  "creator_id",  :null=>false, :index=>{:name=>"fk__generic_announcements_creator_id"}, :foreign_key=>{:references=>"users", :name=>"fk_generic_announcements_creator_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "updater_id",  :null=>false, :index=>{:name=>"fk__generic_announcements_updater_id"}, :foreign_key=>{:references=>"users", :name=>"fk_generic_announcements_updater_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end

  create_table "instance_users", force: :cascade do |t|
    t.integer  "instance_id", :null=>false, :index=>{:name=>"fk__instance_users_instance_id"}, :foreign_key=>{:references=>"instances", :name=>"fk_instance_users_instance_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",     :null=>false, :foreign_key=>{:references=>"users", :name=>"fk_instance_users_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "role",        :default=>0, :null=>false
    t.datetime "created_at",  :null=>false
    t.datetime "updated_at",  :null=>false
  end
  add_index "instance_users", ["instance_id", "user_id"], :name=>"index_instance_users_on_instance_id_and_user_id", :unique=>true

  create_table "read_marks", force: :cascade do |t|
    t.integer  "readable_id"
    t.string   "readable_type", :limit=>255, :null=>false
    t.integer  "reader_id",     :null=>false, :index=>{:name=>"fk__read_marks_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_read_marks_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.datetime "timestamp"
    t.string   "reader_type",   :limit=>255
  end
  add_index "read_marks", ["reader_id", "reader_type", "readable_type", "readable_id"], :name=>"read_marks_reader_readable_index", :unique=>true

  create_table "user_emails", force: :cascade do |t|
    t.boolean  "primary",              :default=>false, :null=>false
    t.integer  "user_id",              :index=>{:name=>"index_user_emails_on_user_id_and_primary", :with=>["primary"], :unique=>true, :where=>"(\"primary\" <> false)"}, :foreign_key=>{:references=>"users", :name=>"fk_user_emails_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "email",                :limit=>255, :null=>false, :index=>{:name=>"index_user_emails_on_email", :unique=>true, :case_sensitive=>false}
    t.string   "confirmation_token",   :limit=>255, :index=>{:name=>"index_user_emails_on_confirmation_token", :unique=>true}
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",    :limit=>255
  end

  create_table "user_identities", force: :cascade do |t|
    t.integer  "user_id",    :null=>false, :index=>{:name=>"fk__user_identities_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_user_identities_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.string   "provider",   :limit=>255, :null=>false, :index=>{:name=>"index_user_identities_on_provider_and_uid", :with=>["uid"], :unique=>true}
    t.string   "uid",        :limit=>255, :null=>false
    t.datetime "created_at", :null=>false
    t.datetime "updated_at", :null=>false
  end

  create_table "user_notifications", force: :cascade do |t|
    t.integer  "activity_id",       :null=>false, :index=>{:name=>"index_user_notifications_on_activity_id"}, :foreign_key=>{:references=>"activities", :name=>"fk_user_notifications_activity_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "user_id",           :null=>false, :index=>{:name=>"index_user_notifications_on_user_id"}, :foreign_key=>{:references=>"users", :name=>"fk_user_notifications_user_id", :on_update=>:no_action, :on_delete=>:no_action}
    t.integer  "notification_type", :default=>0, :null=>false
    t.datetime "created_at",        :null=>false
    t.datetime "updated_at",        :null=>false
  end

end
