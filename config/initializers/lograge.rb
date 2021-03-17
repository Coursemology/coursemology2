# config/initializers/lograge.rb

if Rails.env.production?
  require 'lograge/sql/extension'

  Rails.application.configure do
    # Lograge config
    config.lograge.enabled = true
    config.lograge.formatter = Lograge::Formatters::Json.new
    config.colorize_logging = false

    config.lograge.custom_options = lambda do |event|
      { level: event.payload[:level],
        time: Time.zone.now }
    end

    config.lograge_sql.extract_event = Proc.new do |event|
      { n: event.payload[:name],
        d: event.duration.to_f.round(2) }
    end

    # Format the array of extracted events
    config.lograge_sql.formatter = Proc.new do |sql_queries|
      sql_queries
    end
  end
end