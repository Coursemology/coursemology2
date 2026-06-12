# frozen_string_literal: true
module Course::Gradebook
  def self.table_name_prefix
    "#{Course.table_name.singularize}_gradebook_"
  end
end
