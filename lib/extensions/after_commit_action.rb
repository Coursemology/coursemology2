module Extensions::AfterCommitAction; end
ActiveRecord::Base.class_eval do
  include AfterCommitAction
end
