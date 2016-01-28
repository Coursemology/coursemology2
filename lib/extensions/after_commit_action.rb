# frozen_string_literal: true
module Extensions::AfterCommitAction; end
ActiveRecord::Base.class_eval do
  include AfterCommitAction
end
