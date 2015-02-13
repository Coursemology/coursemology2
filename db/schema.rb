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

ActiveRecord::Schema.define(version: 20150206062133) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "instances", force: true do |t|
    t.string "name", null: false
    t.string "host", null: false, comment: "Stores the host name of the instance. The www prefix is automatically handled by the application"
    t.index ["host"], :name => "index_instances_on_host", :unique => true, :case_sensitive => false
  end

  create_table "users", force: true do |t|
    t.string   "name",                                null: false
    t.integer  "role",                   default: 0,  null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true
  end

  create_table "courses", force: true do |t|
    t.integer  "instance_id",             null: false
    t.string   "title",                   null: false
    t.text     "description"
    t.integer  "status",      default: 0, null: false
    t.datetime "start_at",                null: false
    t.datetime "end_at",                  null: false
    t.integer  "creator_id",              null: false
    t.integer  "updater_id",              null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["creator_id"], :name => "fk__courses_creator_id"
    t.index ["instance_id"], :name => "fk__courses_instance_id"
    t.index ["updater_id"], :name => "fk__courses_updater_id"
    t.foreign_key ["creator_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_courses_creator_id"
    t.foreign_key ["instance_id"], "instances", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_courses_instance_id"
    t.foreign_key ["updater_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_courses_updater_id"
  end

  create_table "course_achievements", force: true do |t|
    t.integer  "course_id",   null: false
    t.string   "title",       null: false
    t.text     "description"
    t.integer  "weight",      null: false
    t.boolean  "published",   null: false
    t.integer  "creator_id",  null: false
    t.integer  "updater_id",  null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["course_id"], :name => "fk__course_achievements_course_id"
    t.index ["creator_id"], :name => "fk__course_achievements_creator_id"
    t.index ["updater_id"], :name => "fk__course_achievements_updater_id"
    t.foreign_key ["course_id"], "courses", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_achievements_course_id"
    t.foreign_key ["creator_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_achievements_creator_id"
    t.foreign_key ["updater_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_achievements_updater_id"
  end

  create_table "course_announcements", force: true do |t|
    t.integer  "course_id",  null: false
    t.string   "title",      null: false
    t.text     "content"
    t.datetime "valid_from", null: false
    t.datetime "valid_to",   null: false
    t.integer  "creator_id", null: false
    t.integer  "updater_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], :name => "fk__course_announcements_course_id"
    t.index ["creator_id"], :name => "fk__course_announcements_creator_id"
    t.index ["updater_id"], :name => "fk__course_announcements_updater_id"
    t.foreign_key ["course_id"], "courses", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_announcements_course_id"
    t.foreign_key ["creator_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_announcements_creator_id"
    t.foreign_key ["updater_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_announcements_updater_id"
  end

  create_table "course_requirement_achievements", force: true do |t|
    t.integer  "course_achievement_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["course_achievement_id"], :name => "index_course_requirement_achievements_on_course_achievement_id"
    t.foreign_key ["course_achievement_id"], "course_achievements", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_requirement_achievements_course_achievement_id"
  end

  create_table "course_requirements", force: true do |t|
    t.integer  "actable_id"
    t.string   "actable_type"
    t.integer  "has_requirement_id"
    t.string   "has_requirement_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["has_requirement_id"], :name => "index_course_requirements_on_has_requirement_id"
  end

  create_table "course_users", force: true do |t|
    t.integer  "course_id",                        null: false
    t.integer  "user_id",                          null: false
    t.integer  "role",             default: 0,     null: false
    t.string   "name",                             null: false
    t.boolean  "phantom",          default: false, null: false
    t.datetime "last_active_time"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["course_id", "user_id"], :name => "index_course_users_on_course_id_and_user_id", :unique => true
    t.index ["course_id"], :name => "fk__course_users_course_id"
    t.index ["user_id"], :name => "fk__course_users_user_id"
    t.foreign_key ["course_id"], "courses", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_users_course_id"
    t.foreign_key ["user_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_course_users_user_id"
  end

  create_table "instance_announcements", force: true do |t|
    t.integer  "instance_id", null: false
    t.string   "title",       null: false
    t.text     "content"
    t.datetime "valid_from",  null: false
    t.datetime "valid_to",    null: false
    t.integer  "creator_id",  null: false
    t.integer  "updater_id",  null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["creator_id"], :name => "fk__instance_announcements_creator_id"
    t.index ["instance_id"], :name => "fk__instance_announcements_instance_id"
    t.index ["updater_id"], :name => "fk__instance_announcements_updater_id"
    t.foreign_key ["creator_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_instance_announcements_creator_id"
    t.foreign_key ["instance_id"], "instances", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_instance_announcements_instance_id"
    t.foreign_key ["updater_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_instance_announcements_updater_id"
  end

  create_table "instance_users", force: true do |t|
    t.integer  "instance_id",             null: false
    t.integer  "user_id",                 null: false
    t.integer  "role",        default: 0, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["instance_id", "user_id"], :name => "index_instance_users_on_instance_id_and_user_id", :unique => true
    t.index ["instance_id"], :name => "fk__instance_users_instance_id"
    t.index ["user_id"], :name => "index_instance_users_on_user_id", :unique => true
    t.foreign_key ["instance_id"], "instances", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_instance_users_instance_id"
    t.foreign_key ["user_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_instance_users_user_id"
  end

  create_table "user_emails", force: true do |t|
    t.boolean  "primary",              default: false, null: false
    t.integer  "user_id",                              null: false
    t.string   "email",                                null: false
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.index ["confirmation_token"], :name => "index_user_emails_on_confirmation_token", :unique => true
    t.index ["email"], :name => "index_user_emails_on_email", :unique => true, :case_sensitive => false
    t.index ["user_id", "primary"], :name => "index_user_emails_on_user_id_and_primary", :unique => true, :conditions => "(\"primary\" <> false)"
    t.foreign_key ["user_id"], "users", ["id"], :on_update => :no_action, :on_delete => :no_action, :name => "fk_user_emails_user_id"
  end

end
