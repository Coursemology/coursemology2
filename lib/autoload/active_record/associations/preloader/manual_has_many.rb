# frozen_string_literal: true
class ActiveRecord::Associations::Preloader
  class ManualHasMany < HasMany
    prepend ManualAssociationPreloader
  end
end
