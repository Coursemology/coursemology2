# frozen_string_literal: true
class ConvertComprehensionExplanationToPlainText < ActiveRecord::Migration[5.1]
  def up
    Course::Assessment::Question::TextResponseComprehensionSolution.
      find_each do |s|
      unless s.explanation.nil?
        # replace all HTML tags with ' '
        s_explanation = s.explanation.
                        gsub(/\<(.*?)\>/, ' ').
                        strip
        s.update_column(:explanation, s_explanation)
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
