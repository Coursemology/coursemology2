# frozen_string_literal: true
class ActiveRecord::Associations::Preloader
  class ManualHasMany < Association
    prepend ManualAssociationPreloader
  end
end
