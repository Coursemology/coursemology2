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

ActiveRecord::Schema.define(version: 20150425030128) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "users", force: :cascade do |t|
    t.string   "name",                   limit: 255,              null: false
    t.integer  "role",                   default: 0,  null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255, index: {name: "index_users_on_reset_password_token", unique: true}
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "attachments", force: :cascade do |t|
    t.string   "name",            null: false
    t.integer  "attachable_id"
    t.string   "attachable_type", index: {name: "index_attachments_on_attachable_type_and_attachable_id", with: ["attachable_id"]}
    t.text     "file_upload",     null: false
    t.integer  "creator_id",      null: false, index: {name: "fk__attachments_creator_id"}, foreign_key: {references: "users", name: "fk_attachments_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id",      null: false, index: {name: "fk__attachments_updater_id"}, foreign_key: {references: "users", name: "fk_attachments_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "instances", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "host", limit: 255, null: false, comment: "Stores the host name of the instance. The www prefix is automatically handled by the application", index: {name: "index_instances_on_host", unique: true, case_sensitive: false}
  end

  create_table "courses", force: :cascade do |t|
    t.integer  "instance_id", null: false, index: {name: "fk__courses_instance_id"}, foreign_key: {references: "instances", name: "fk_courses_instance_id", on_update: :no_action, on_delete: :no_action}
    t.string   "title",       limit: 255,             null: false
    t.text     "description"
    t.text     "logo"
    t.integer  "status",      default: 0, null: false
    t.datetime "start_at",    null: false
    t.datetime "end_at",      null: false
    t.integer  "creator_id",  null: false, index: {name: "fk__courses_creator_id"}, foreign_key: {references: "users", name: "fk_courses_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id",  null: false, index: {name: "fk__courses_updater_id"}, foreign_key: {references: "users", name: "fk_courses_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "course_achievements", force: :cascade do |t|
    t.integer  "course_id",   null: false, index: {name: "fk__course_achievements_course_id"}, foreign_key: {references: "courses", name: "fk_course_achievements_course_id", on_update: :no_action, on_delete: :no_action}
    t.string   "title",       limit: 255, null: false
    t.text     "description"
    t.integer  "weight",      null: false
    t.boolean  "published",   null: false
    t.integer  "creator_id",  null: false, index: {name: "fk__course_achievements_creator_id"}, foreign_key: {references: "users", name: "fk_course_achievements_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id",  null: false, index: {name: "fk__course_achievements_updater_id"}, foreign_key: {references: "users", name: "fk_course_achievements_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "course_announcements", force: :cascade do |t|
    t.integer  "course_id",  null: false, index: {name: "fk__course_announcements_course_id"}, foreign_key: {references: "courses", name: "fk_course_announcements_course_id", on_update: :no_action, on_delete: :no_action}
    t.string   "title",      limit: 255,                 null: false
    t.text     "content"
    t.boolean  "sticky",     default: false, null: false
    t.datetime "valid_from", null: false
    t.datetime "valid_to",   null: false
    t.integer  "creator_id", null: false, index: {name: "fk__course_announcements_creator_id"}, foreign_key: {references: "users", name: "fk_course_announcements_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id", null: false, index: {name: "fk__course_announcements_updater_id"}, foreign_key: {references: "users", name: "fk_course_announcements_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "course_users", force: :cascade do |t|
    t.integer  "course_id",        null: false, index: {name: "fk__course_users_course_id"}, foreign_key: {references: "courses", name: "fk_course_users_course_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "user_id",          null: false, index: {name: "fk__course_users_user_id"}, foreign_key: {references: "users", name: "fk_course_users_user_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "role",             default: 0,     null: false
    t.string   "name",             limit: 255,                 null: false
    t.boolean  "phantom",          default: false, null: false
    t.datetime "last_active_time"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end
  add_index "course_users", ["course_id", "user_id"], name: "index_course_users_on_course_id_and_user_id", unique: true

  create_table "instance_announcements", force: :cascade do |t|
    t.integer  "instance_id", null: false, index: {name: "fk__instance_announcements_instance_id"}, foreign_key: {references: "instances", name: "fk_instance_announcements_instance_id", on_update: :no_action, on_delete: :no_action}
    t.string   "title",       limit: 255, null: false
    t.text     "content"
    t.datetime "valid_from",  null: false
    t.datetime "valid_to",    null: false
    t.integer  "creator_id",  null: false, index: {name: "fk__instance_announcements_creator_id"}, foreign_key: {references: "users", name: "fk_instance_announcements_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id",  null: false, index: {name: "fk__instance_announcements_updater_id"}, foreign_key: {references: "users", name: "fk_instance_announcements_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "instance_users", force: :cascade do |t|
    t.integer  "instance_id", null: false, index: {name: "fk__instance_users_instance_id"}, foreign_key: {references: "instances", name: "fk_instance_users_instance_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "user_id",     null: false, index: {name: "index_instance_users_on_user_id", unique: true}, foreign_key: {references: "users", name: "fk_instance_users_user_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "role",        default: 0, null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end
  add_index "instance_users", ["instance_id", "user_id"], name: "index_instance_users_on_instance_id_and_user_id", unique: true

  create_table "notifications", force: :cascade do |t|
    t.integer  "user_id",    null: false, index: {name: "fk__notifications_on_user_id"}, foreign_key: {references: "users", name: "fk_notifications_user_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "course_id",  null: false, index: {name: "fk__notifications_on_course_id"}, foreign_key: {references: "courses", name: "fk_notifications_course_id", on_update: :no_action, on_delete: :no_action}
    t.string   "type"
    t.string   "title"
    t.text     "content"
    t.string   "image"
    t.string   "link"
    t.boolean  "share"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "read_marks", force: :cascade do |t|
    t.integer  "readable_id"
    t.string   "readable_type", limit: 255, null: false
    t.integer  "user_id",       null: false, index: {name: "fk__read_marks_user_id"}, foreign_key: {references: "users", name: "fk_read_marks_user_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "timestamp"
  end
  add_index "read_marks", ["user_id", "readable_type", "readable_id"], name: "index_read_marks_on_user_id_and_readable_type_and_readable_id"

  create_table "system_announcements", force: :cascade do |t|
    t.string   "title",      limit: 255, null: false
    t.text     "content"
    t.datetime "valid_from", null: false
    t.datetime "valid_to",   null: false
    t.integer  "creator_id", null: false, index: {name: "fk__system_announcements_creator_id"}, foreign_key: {references: "users", name: "fk_system_announcements_creator_id", on_update: :no_action, on_delete: :no_action}
    t.integer  "updater_id", null: false, index: {name: "fk__system_announcements_updater_id"}, foreign_key: {references: "users", name: "fk_system_announcements_updater_id", on_update: :no_action, on_delete: :no_action}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_emails", force: :cascade do |t|
    t.boolean  "primary",              default: false, null: false
    t.integer  "user_id",              null: false, index: {name: "index_user_emails_on_user_id_and_primary", with: ["primary"], unique: true, where: "(\"primary\" <> false)"}, foreign_key: {references: "users", name: "fk_user_emails_user_id", on_update: :no_action, on_delete: :no_action}
    t.string   "email",                limit: 255,                 null: false, index: {name: "index_user_emails_on_email", unique: true, case_sensitive: false}
    t.string   "confirmation_token",   limit: 255, index: {name: "index_user_emails_on_confirmation_token", unique: true}
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",    limit: 255
  end

end
