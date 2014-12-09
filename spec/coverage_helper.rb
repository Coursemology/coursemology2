# Helper to include Coveralls/Code Climate coverage, but not require developers to install the gem.
#
# @param name [String] The name of the module to require.
# @param initialiser [Proc] The block to execute when the module is required successfully.
def load_provider(name, &initialiser)
  require name
  initialiser.call
rescue LoadError => e
  if e.path == name
    puts 'Cannot find \'%s\', ignoring' % [name] if ENV['CI']
  else
    raise e
  end
end

# Coveralls
load_provider('coveralls') do
  Coveralls.wear!('rails')
end

# Code Climate
load_provider('codeclimate-test-reporter') do
  CodeClimate::TestReporter.start
end
