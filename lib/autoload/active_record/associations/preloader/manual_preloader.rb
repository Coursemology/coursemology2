# frozen_string_literal: true
class ActiveRecord::Associations::Preloader
  # A manual preloader, inspired by
  # https://mrbrdo.wordpress.com/2013/09/25/manually-preloading-associations-in-rails
  class ManualPreloader < ActiveRecord::Associations::Preloader
    # Preloads the given owners by specifying the children for the given association.
    def preload(owners, associations, children)
      super
    end

    def preloader_for(reflection, owners)
      preloader_class = super
      return preloader_class if preloader_class.name == AlreadyLoaded.name

      if reflection.instance_of? ActiveRecord::Reflection::HasManyReflection
        return ActiveRecord::Associations::Preloader::ManualHasMany
      end

      raise NotImplementedError
    end
  end
end
