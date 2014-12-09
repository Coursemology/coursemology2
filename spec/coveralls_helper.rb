# Helper to include Coveralls, but not require developers to install the gem.
begin
  require 'coveralls'
  Coveralls.wear!('rails')
rescue LoadError => e
  if e.path != 'coveralls'
    raise e
  end
end
