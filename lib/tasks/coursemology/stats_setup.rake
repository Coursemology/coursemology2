# frozen_string_literal: true
task stats: 'coursemology:stats_setup'

namespace :coursemology do
  types = {
    'Services' => 'app/services'
  }.freeze

  task :stats_setup do
    last_app_entry = ::STATS_DIRECTORIES.find_index { |item| item.first =~ /specs/ }
    types.each do |type, directory|
      ::STATS_DIRECTORIES.insert(last_app_entry, [type, directory])
      last_app_entry += 1
    end
  end
end
