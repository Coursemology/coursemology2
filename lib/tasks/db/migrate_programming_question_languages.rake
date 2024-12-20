# frozen_string_literal: true
namespace :db do
  task migrate_programming_question_languages: :environment do
    ActsAsTenant.without_tenant do
      puts 'Input SOURCE programming language name or class name:'
      src_query = $stdin.gets.strip
      src_language = Coursemology::Polyglot::Language.where(name: src_query).first
      src_language = Coursemology::Polyglot::Language.where(type: src_query).first if src_language.nil?
      abort("SOURCE programming language \"#{src_query}\" not found") if src_language.nil?

      puts 'Input DESTINATION programming language name or class name:'
      dest_query = $stdin.gets.strip
      dest_language = Coursemology::Polyglot::Language.where(name: dest_query).first
      dest_language = Coursemology::Polyglot::Language.where(type: dest_query).first if dest_language.nil?
      abort("DESTINATION programming language \"#{dest_query}\" not found") if dest_language.nil?

      if src_language.id == dest_language.id
        puts 'SOURCE and DESTINATION languages are identical'
      else
        migration_count = Course::Assessment::Question::Programming.where(language_id: src_language.id).count
        puts "This operation will migrate all programming questions using language \"#{src_language.name}\" (language_id #{src_language.id})" # rubocop:disable Layout/LineLength
        puts "to language \"#{dest_language.name}\" (language_id #{dest_language.id})."
        puts "#{migration_count} programming questions will be affected."
        puts 'Are you sure you wish to proceed? (Y/N): '
        confirm = $stdin.gets.strip
        if confirm == 'Y'
          ActiveRecord::Base.transaction do
            Course::Assessment::Question::Programming.
              where(language_id: src_language.id).update_all(language_id: dest_language.id)
          end

          puts "#{migration_count} programming questions successfully migrated."
        else
          puts 'Programming language migration cancelled!'
        end
      end
    end
  end
end
