# frozen_string_literal: true
class ActiveRecord::Associations::Preloader
  # A manual preloader, inspired by
  # https://mrbrdo.wordpress.com/2013/09/25/manually-preloading-associations-in-rails
  class ManualPreloader < ActiveRecord::Associations::Preloader
    # Preloads the given owners by specifying the children for the given association.
    def preload(owners, associations, children)
      super
    end

    def preloader_for(reflection, owners, rhs_klass)
      preloader_class = super
      case preloader_class.name
      when HasMany.name
        ActiveRecord::Associations::Preloader::ManualHasMany
      when HasManyThrough.name
        ActiveRecord::Associations::Preloader::ManualHasManyThrough
      when NullPreloader.name, AlreadyLoaded.name
        preloader_class
      else
        raise NotImplementedError
      end
    end
  end
end
