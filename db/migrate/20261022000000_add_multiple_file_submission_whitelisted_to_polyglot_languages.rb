# frozen_string_literal: true
#
# Adds a language flag for whether programming questions in that language can be set to multiple
# file submission, replacing the hard-coded Java-only check in the question form.
class AddMultipleFileSubmissionWhitelistedToPolyglotLanguages < ActiveRecord::Migration[8.1]
  def up
    add_column :polyglot_languages, :multiple_file_submission_whitelisted, :boolean, default: false, null: false

    Rake::Task['db:set_polyglot_language_flags'].invoke
  end

  def down
    remove_column :polyglot_languages, :multiple_file_submission_whitelisted
  end
end
