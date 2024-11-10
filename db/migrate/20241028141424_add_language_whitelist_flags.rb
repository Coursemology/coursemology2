class AddLanguageWhitelistFlags < ActiveRecord::Migration[7.2]
  def change
    add_column :polyglot_languages, :default_evaluator_whitelisted, :boolean, default: true, null: false
    add_column :polyglot_languages, :codaveri_evaluator_whitelisted, :boolean, default: false, null: false
    add_column :polyglot_languages, :question_generation_whitelisted, :boolean, default: false, null: false
    add_column :polyglot_languages, :koditsu_whitelisted, :boolean, default: false, null: false

    Rake::Task['db:set_polyglot_language_flags'].invoke
  end
end
