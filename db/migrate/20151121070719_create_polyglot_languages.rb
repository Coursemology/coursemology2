class CreatePolyglotLanguages < ActiveRecord::Migration
  def change
    create_table :polyglot_languages do |t|
      t.string :type, null: false, comment: 'The class of language, as perceived by '\
                                            'the application.'
      t.string :name, null: false, index: { unique: true, case_sensitive: false }
      t.references :parent, foreign_key: { references: :polyglot_languages }
    end
  end
end
