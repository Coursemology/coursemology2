class AddDeprecationSupportForPolyglot < ActiveRecord::Migration[7.0]
  def change
    add_column :polyglot_languages, :weight, :integer

    reversible do |dir|
      dir.up do
        execute <<-SQL
          CREATE SEQUENCE polyglot_languages_weight_seq START 1;
          ALTER TABLE polyglot_languages ALTER COLUMN weight SET DEFAULT nextval('polyglot_languages_weight_seq');
        SQL

        # Optionally update existing records with a custom order
        execute <<-SQL
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'JavaScript';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Java 8';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Java 11';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Java 17';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 2.7';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.4';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.5';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.6';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.7';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.9';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.10';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'Python 3.12';
          UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = 'C/C++';     
        SQL
      end

      dir.down do
        execute <<-SQL
          ALTER TABLE polyglot_languages ALTER COLUMN weight DROP DEFAULT;
          DROP SEQUENCE polyglot_languages_weight_seq;
        SQL
      end
    end

    add_column :polyglot_languages, :enabled, :boolean, default: true, null: false
  end
end
